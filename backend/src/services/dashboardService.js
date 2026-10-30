const { db } = require('../models');

const dashboardService = {
  async getSummaryStats(user = null) {
    const isChw = user && user.role === 'chw';
    const chwFilter = isChw ? { assigned_chw_id: user.id } : {};
    const chwActivitiesFilter = isChw ? { chw_id: user.id } : {};

    const [
      totalPatients, totalHouseholds, totalCHWs, totalEncounters,
      pendingSyncs, failedSyncs, activeVisitsThisMonth, totalReferrals,
      visitsToday,
    ] = await Promise.all([
      db.patients().where({ status: 'active', ...chwFilter }).count('id as count').first(),
      db.households().where({ status: 'active', ...(isChw ? { assigned_chw_id: user.id } : {}) }).count('id as count').first(),
      db.users().where({ role: 'chw', is_active: true }).count('id as count').first(),
      db.encounters().count('id as count').first(),
      db.syncLog().where({ status: 'pending' }).count('id as count').first(),
      db.syncLog().where({ status: 'failed' }).count('id as count').first(),
      db.chwActivities()
        .where('visit_date', '>=', new Date(new Date().setDate(1)).toISOString())
        .where(chwActivitiesFilter)
        .count('id as count').first(),
      db.encounters().where({ encounter_type: 'referral' }).count('id as count').first(),
      db.encounters()
        .where('encounter_datetime', '>=', new Date().toISOString().slice(0, 10))
        .where('encounter_datetime', '<', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10))
        .where(isChw ? { chw_id: user.id } : {})
        .count('id as count').first(),
    ]);

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const recentSyncs = await db.syncLog()
      .where('created_at', '>=', thirtyDaysAgo)
      .select('status')
      .count('id as count')
      .groupBy('status');

    const totalSyncs = recentSyncs.reduce((sum, r) => sum + parseInt(r.count), 0);
    const successfulSyncs = recentSyncs.find((r) => r.status === 'success');
    const syncSuccessRate = totalSyncs > 0
      ? Math.round((parseInt(successfulSyncs?.count || 0) / totalSyncs) * 100)
      : 0;

    return {
      totalPatients: parseInt(totalPatients.count),
      totalHouseholds: parseInt(totalHouseholds.count),
      totalCHWs: parseInt(totalCHWs.count),
      totalEncounters: parseInt(totalEncounters.count),
      pendingSyncs: parseInt(pendingSyncs.count),
      failedSyncs: parseInt(failedSyncs.count),
      activeVisitsThisMonth: parseInt(activeVisitsThisMonth.count),
      syncSuccessRate,
      totalReferrals: parseInt(totalReferrals.count),
      visitsToday: parseInt(visitsToday.count),
    };
  },

  async getRecentReferrals(user = null, limit = 10) {
    let query = db.encounters()
      .select(
        'encounters.*',
        db.knex.raw("(p.first_name || ' ' || p.last_name) as patient_name"),
        db.knex.raw("(chw.first_name || ' ' || chw.last_name) as chw_name")
      )
      .join('patients as p', 'encounters.patient_id', 'p.id')
      .leftJoin('users as chw', 'encounters.chw_id', 'chw.id')
      .where('encounters.encounter_type', 'referral')
      .orderBy('encounters.encounter_datetime', 'desc');

    if (user && user.role === 'chw') {
      query = query.where('encounters.chw_id', user.id);
    }

    const referrals = await query.limit(limit);
    return referrals.map((r) => ({
      ...r,
      details: r.observations ? JSON.parse(r.observations) : null,
    }));
  },

  async getSyncStatus() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const [byDirection, byEntity, recentActivity, lastSyncTime] = await Promise.all([
      db.syncLog()
        .where('created_at', '>=', thirtyDaysAgo)
        .select('direction', 'status')
        .count('id as count')
        .groupBy('direction', 'status')
        .orderBy('direction'),
      db.syncLog()
        .where('created_at', '>=', thirtyDaysAgo)
        .select('entity_type', 'status')
        .count('id as count')
        .groupBy('entity_type', 'status')
        .orderBy('entity_type'),
      db.syncLog()
        .where('created_at', '>=', thirtyDaysAgo)
        .select('id', 'entity_type', 'direction', 'status', 'created_at', 'error_message')
        .orderBy('created_at', 'desc')
        .limit(20),
      db.syncLog()
        .where({ status: 'success' })
        .orderBy('completed_at', 'desc')
        .select('completed_at')
        .first(),
    ]);

    return { byDirection, byEntity, recentActivity, lastSyncTime: lastSyncTime?.completed_at };
  },

  async getCHWActivity(filters = {}) {
    const { startDate, endDate, chwId } = filters;
    let query = db.chwActivities()
      .select(
        'chw_activities.*',
        db.knex.raw("(users.first_name || ' ' || users.last_name) as chw_name")
      )
      .leftJoin('users', 'chw_activities.chw_id', 'users.id')
      .orderBy('visit_date', 'desc');

    if (startDate) query = query.where('visit_date', '>=', startDate);
    if (endDate) query = query.where('visit_date', '<=', endDate);
    if (chwId) query = query.where('chw_id', chwId);

    const activities = await query.limit(100);

    const byType = await db.chwActivities()
      .select('activity_type')
      .count('id as count')
      .groupBy('activity_type')
      .orderBy('count', 'desc');

    const byCHW = await db.chwActivities()
      .select(
        'chw_id',
        db.knex.raw("(users.first_name || ' ' || users.last_name) as chw_name"),
        db.knex.raw('COUNT(*) as count')
      )
      .leftJoin('users', 'chw_activities.chw_id', 'users.id')
      .groupBy('chw_id', 'users.first_name', 'users.last_name')
      .orderBy('count', 'desc');

    return { activities, byType, byCHW };
  },

  async getSystemHealth() {
    const [echisConfig, openmrsConfig] = await Promise.all([
      db.systemConfig().where({ key: 'echis_connection' }).first(),
      db.systemConfig().where({ key: 'openmrs_connection' }).first(),
    ]);

    const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    const [recentSyncs, recentFailures] = await Promise.all([
      db.syncLog().where('created_at', '>=', thirtyMinAgo).count('id as count').first(),
      db.syncLog().where('created_at', '>=', thirtyMinAgo).where({ status: 'failed' }).count('id as count').first(),
    ]);

    const echis = echisConfig ? JSON.parse(echisConfig.value) : { status: 'unknown' };
    const openmrs = openmrsConfig ? JSON.parse(openmrsConfig.value) : { status: 'unknown' };

    return {
      echis: { status: echis.status, lastConnected: echis.last_connected, recentActivity: parseInt(recentSyncs.count), recentFailures: parseInt(recentFailures.count) },
      openmrs: { status: openmrs.status, lastConnected: openmrs.last_connected, recentActivity: parseInt(recentSyncs.count), recentFailures: parseInt(recentFailures.count) },
      database: { status: 'connected' },
    };
  },

  async getPatientStats(user = null) {
    const isChw = user && user.role === 'chw';
    const chwFilter = isChw ? { assigned_chw_id: user.id } : {};

    const total = await db.patients().where(chwFilter).count('id as count').first();

    const byGender = await db.patients()
      .where(chwFilter)
      .select('gender')
      .count('id as count')
      .groupBy('gender');

    const rows = await db.patients().where(chwFilter).select('date_of_birth');
    const AGE_GROUPS = ['infant', 'toddler', 'child', 'young_adult', 'adult', 'elderly'];
    const ageGroups = {};
    for (const g of AGE_GROUPS) ageGroups[g] = 0;
    const now = new Date();
    for (const r of rows) {
      const dob = new Date(r.date_of_birth);
      let age = now.getFullYear() - dob.getFullYear();
      const m = now.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
      let group;
      if (age < 1) group = 'infant';
      else if (age <= 5) group = 'toddler';
      else if (age <= 17) group = 'child';
      else if (age <= 35) group = 'young_adult';
      else if (age <= 60) group = 'adult';
      else group = 'elderly';
      ageGroups[group] += 1;
    }
    const byAgeGroup = AGE_GROUPS.map((age_group) => ({ age_group, count: String(ageGroups[age_group]) }));

    const byVillage = await db.patients()
      .select('village')
      .count('id as count')
      .whereNotNull('village')
      .where(chwFilter)
      .groupBy('village')
      .orderBy('count', 'desc');

    return { total: parseInt(total.count), byGender, byAgeGroup, byVillage };
  },
};

module.exports = dashboardService;
