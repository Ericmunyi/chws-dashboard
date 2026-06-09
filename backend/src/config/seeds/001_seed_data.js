const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

exports.seed = async function (knex) {
  await knex('audit_log').del();
  await knex('chw_activities').del();
  await knex('sync_log').del();
  await knex('encounters').del();
  await knex('patients').del();
  await knex('households').del();
  await knex('refresh_tokens').del();
  await knex('users').del();
  await knex('regions').del();
  await knex('system_config').del();

  const hash = await bcrypt.hash('Password123!', 12);

  const adminId = uuidv4();
  const managerId = uuidv4();
  const chw1Id = uuidv4();
  const chw2Id = uuidv4();

  await knex('users').insert([
    { id: adminId, username: 'admin', email: 'admin@chws.gov', password_hash: hash, first_name: 'System', last_name: 'Admin', role: 'admin', phone: '+254700100001', is_active: 1 },
    { id: managerId, username: 'manager', email: 'manager@chws.gov', password_hash: hash, first_name: 'Jane', last_name: 'Wanjiku', role: 'manager', phone: '+254700100002', is_active: 1 },
    { id: chw1Id, username: 'chw1', email: 'chw1@chws.gov', password_hash: hash, first_name: 'John', last_name: 'Kamau', role: 'chw', phone: '+254700100003', is_active: 1 },
    { id: chw2Id, username: 'chw2', email: 'chw2@chws.gov', password_hash: hash, first_name: 'Mary', last_name: 'Achieng', role: 'chw', phone: '+254700100004', is_active: 1 },
  ]);

  const countyId = uuidv4();
  const subCountyId = uuidv4();
  const wardId = uuidv4();

  await knex('regions').insert([
    { id: countyId, name: 'Kisumu County', code: 'KC-042', type: 'county' },
    { id: subCountyId, name: 'Kisumu East', code: 'SC-KE-001', type: 'sub_county', parent_id: countyId },
    { id: wardId, name: 'Manyatta B', code: 'WD-MB-001', type: 'ward', parent_id: subCountyId },
  ]);

  const hh1 = uuidv4(), hh2 = uuidv4(), hh3 = uuidv4(), hh4 = uuidv4();

  await knex('households').insert([
    { id: hh1, echis_household_id: 'ECH-HH-001', head_name: 'Peter Ochieng', head_phone: '+254722100001', village: 'Kanyakwar', ward: 'Manyatta B', sub_county: 'Kisumu East', county: 'Kisumu', hamlet: 'A', landmark: 'Near Kanyakwar Primary', latitude: -0.0917, longitude: 34.768, member_count: 5, assigned_chw_id: chw1Id, status: 'active' },
    { id: hh2, echis_household_id: 'ECH-HH-002', head_name: 'Grace Akinyi', head_phone: '+254722100002', village: 'Kanyakwar', ward: 'Manyatta B', sub_county: 'Kisumu East', county: 'Kisumu', hamlet: 'B', landmark: 'Opposite Kanyakwar Market', latitude: -0.0925, longitude: 34.769, member_count: 3, assigned_chw_id: chw1Id, status: 'active' },
    { id: hh3, echis_household_id: 'ECH-HH-003', head_name: 'Samuel Otieno', head_phone: '+254722100003', village: 'Nyalenda', ward: 'Manyatta B', sub_county: 'Kisumu East', county: 'Kisumu', hamlet: 'C', landmark: 'Near Nyalenda Health Center', latitude: -0.093, longitude: 34.77, member_count: 6, assigned_chw_id: chw2Id, status: 'active' },
    { id: hh4, echis_household_id: 'ECH-HH-004', head_name: 'Diana Atieno', head_phone: '+254722100004', village: 'Nyalenda', ward: 'Manyatta B', sub_county: 'Kisumu East', county: 'Kisumu', hamlet: 'A', landmark: 'Next to Nyalenda Dispensary', latitude: -0.0935, longitude: 34.771, member_count: 4, assigned_chw_id: chw2Id, status: 'active' },
  ]);

  const households = [hh1, hh1, hh1, hh2, hh2, hh3, hh3, hh3, hh4, hh4];
  const patientData = [
    { first: 'James', last: 'Ochieng', dob: '1985-03-15', gender: 'Male', phone: '+254722100011', village: 'Kanyakwar' },
    { first: 'Sarah', last: 'Ochieng', dob: '1990-07-22', gender: 'Female', phone: '+254722100012', village: 'Kanyakwar' },
    { first: 'Kevin', last: 'Ochieng', dob: '2015-11-08', gender: 'Male', phone: '', village: 'Kanyakwar' },
    { first: 'Esther', last: 'Akinyi', dob: '1988-01-10', gender: 'Female', phone: '+254722100021', village: 'Kanyakwar' },
    { first: 'David', last: 'Akinyi', dob: '1982-09-05', gender: 'Male', phone: '+254722100022', village: 'Kanyakwar' },
    { first: 'Michael', last: 'Otieno', dob: '1978-12-20', gender: 'Male', phone: '+254722100031', village: 'Nyalenda' },
    { first: 'Catherine', last: 'Otieno', dob: '1983-04-15', gender: 'Female', phone: '+254722100032', village: 'Nyalenda' },
    { first: 'Baby', last: 'Otieno', dob: '2023-06-01', gender: 'Female', phone: '', village: 'Nyalenda' },
    { first: 'Paul', last: 'Atieno', dob: '1992-08-30', gender: 'Male', phone: '+254722100041', village: 'Nyalenda' },
    { first: 'Rose', last: 'Atieno', dob: '1995-02-14', gender: 'Female', phone: '+254722100042', village: 'Nyalenda' },
  ];

  const patientIds = [];
  for (let i = 0; i < patientData.length; i++) {
    const pid = uuidv4();
    patientIds.push(pid);
    const p = patientData[i];
    const chw = i < 5 ? chw1Id : chw2Id;
    await knex('patients').insert({
      id: pid,
      openmrs_uuid: `openmrs-${1000 + i}`,
      echis_id: `ECH-PAT-${1000 + i}`,
      national_id: `${10000000 + i}`,
      first_name: p.first,
      last_name: p.last,
      date_of_birth: p.dob,
      gender: p.gender,
      phone: p.phone,
      village: p.village,
      ward: 'Manyatta B',
      sub_county: 'Kisumu East',
      county: 'Kisumu',
      assigned_chw_id: chw,
      household_id: households[i],
      status: 'active',
      last_synced_at: new Date(),
    });
  }

  const encTypes = ['home_visit', 'follow_up', 'immunization', 'health_education', 'screening'];
  for (let i = 0; i < patientIds.length; i++) {
    const numEncounters = 2 + Math.floor(Math.random() * 4);
    const chw = i < 5 ? chw1Id : chw2Id;
    for (let e = 0; e < numEncounters; e++) {
      const encDate = new Date(2025, 0, 1);
      encDate.setDate(encDate.getDate() + Math.floor(Math.random() * 520));
      await knex('encounters').insert({
        id: uuidv4(),
        openmrs_encounter_uuid: `enc-${i}-${e}`,
        patient_id: patientIds[i],
        chw_id: chw,
        encounter_type: encTypes[Math.floor(Math.random() * encTypes.length)],
        encounter_datetime: encDate.toISOString(),
        location: patientData[i].village,
        latitude: -0.091 + Math.random() * 0.005,
        longitude: 34.768 + Math.random() * 0.005,
        observations: JSON.stringify({
          bp_systolic: 100 + Math.floor(Math.random() * 40),
          bp_diastolic: 60 + Math.floor(Math.random() * 30),
          heart_rate: 60 + Math.floor(Math.random() * 40),
          temperature: 36 + Math.random() * 1.5,
          weight_kg: 50 + Math.random() * 30,
        }),
        sync_status: Math.random() > 0.2 ? 'synced' : 'pending',
        last_synced_at: Math.random() > 0.2 ? new Date() : null,
      });
    }
  }

  const actTypes = ['household_visit', 'patient_assessment', 'health_education_session', 'referral', 'defaulter_tracing', 'community_dialogue'];
  for (let i = 0; i < 20; i++) {
    const chw = i < 10 ? chw1Id : chw2Id;
    const actDate = new Date(2025, 0, 1);
    actDate.setDate(actDate.getDate() + Math.floor(Math.random() * 180));
    await knex('chw_activities').insert({
      id: uuidv4(),
      chw_id: chw,
      activity_type: actTypes[Math.floor(Math.random() * actTypes.length)],
      patient_id: patientIds[Math.floor(Math.random() * patientIds.length)],
      household_id: i < 10 ? hh1 : hh3,
      visit_date: actDate.toISOString(),
      duration_minutes: String(15 + Math.floor(Math.random() * 60)),
      notes: `Routine visit`,
      assessments: JSON.stringify({ nutrition_status: Math.random() > 0.5 ? 'normal' : 'at_risk', sanitation: Math.random() > 0.3 ? 'improved' : 'unimproved', water_source: Math.random() > 0.4 ? 'safe' : 'unsafe' }),
      latitude: -0.091 + Math.random() * 0.005,
      longitude: 34.768 + Math.random() * 0.005,
      sync_status: Math.random() > 0.15 ? 'synced' : 'pending',
    });
  }

  const statuses = ['success', 'failed', 'pending', 'in_progress'];
  for (let i = 0; i < 30; i++) {
    await knex('sync_log').insert({
      id: uuidv4(),
      entity_type: ['patient', 'encounter', 'chw_activity', 'household'][Math.floor(Math.random() * 4)],
      entity_id: uuidv4(),
      direction: ['push_to_echis', 'pull_from_echis', 'push_to_openmrs', 'pull_from_openmrs'][Math.floor(Math.random() * 4)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      attempt_count: Math.floor(Math.random() * 4),
      last_attempt_at: null,
      completed_at: null,
    });
  }

  await knex('system_config').insert([
    { key: 'sync_settings', value: JSON.stringify({ interval_ms: 300000, batch_size: 100, retry_attempts: 3, retry_delay_ms: 60000 }), description: 'System-wide sync configuration' },
    { key: 'echis_connection', value: JSON.stringify({ base_url: 'https://api.echis.kenya.go.ke/v1', status: 'disconnected', last_connected: null }), description: 'eCHIS API connection settings' },
    { key: 'openmrs_connection', value: JSON.stringify({ base_url: 'http://localhost:8080/openmrs/ws/fhir2/R4', status: 'disconnected', last_connected: null }), description: 'OpenMRS FHIR connection settings' },
  ]);
};
