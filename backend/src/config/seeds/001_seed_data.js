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
    { id: adminId, username: 'admin', email: 'admin@chws.gov', password_hash: hash, first_name: 'System', last_name: 'Admin', role: 'admin', phone: '+254700100001', is_active: true },
    { id: managerId, username: 'manager', email: 'manager@chws.gov', password_hash: hash, first_name: 'Jane', last_name: 'Wanjiku', role: 'manager', phone: '+254700100002', is_active: true },
    { id: chw1Id, username: 'chw1', email: 'chw1@chws.gov', password_hash: hash, first_name: 'John', last_name: 'Kamau', role: 'chw', phone: '+254700100003', is_active: true },
    { id: chw2Id, username: 'chw2', email: 'chw2@chws.gov', password_hash: hash, first_name: 'Mary', last_name: 'Achieng', role: 'chw', phone: '+254700100004', is_active: true },
  ]);

  const embuId = uuidv4();
  const uasinGishuId = uuidv4();
  const busiaId = uuidv4();

  const manyattaId = uuidv4();
  const runyenjesId = uuidv4();
  const soyId = uuidv4();
  const turboId = uuidv4();
  const busiaTwnId = uuidv4();
  const butulaId = uuidv4();

  const manyattaWardId = uuidv4();
  const njukiriWardId = uuidv4();
  const runyenjesWardId = uuidv4();
  const kagaariWardId = uuidv4();
  const ziwaWardId = uuidv4();
  const kipsombaWardId = uuidv4();
  const kamagutWardId = uuidv4();
  const tapsagoiWardId = uuidv4();
  const busiaTownWardId = uuidv4();
  const mujengoWardId = uuidv4();
  const mundikaWardId = uuidv4();
  const nambiaWardId = uuidv4();

  await knex('regions').insert([
    { id: embuId, name: 'EMBU County', code: 'KC-042', type: 'county' },
    { id: uasinGishuId, name: 'UASIN GISHU County', code: 'KC-023', type: 'county' },
    { id: busiaId, name: 'BUSIA County', code: 'KC-046', type: 'county' },

    { id: manyattaId, name: 'Manyatta', code: 'SC-EM-001', type: 'sub_county', parent_id: embuId },
    { id: runyenjesId, name: 'Runyenjes', code: 'SC-EM-002', type: 'sub_county', parent_id: embuId },

    { id: soyId, name: 'Soy', code: 'SC-UG-001', type: 'sub_county', parent_id: uasinGishuId },
    { id: turboId, name: 'Turbo', code: 'SC-UG-002', type: 'sub_county', parent_id: uasinGishuId },

    { id: busiaTwnId, name: 'Busia Township', code: 'SC-BU-001', type: 'sub_county', parent_id: busiaId },
    { id: butulaId, name: 'Butula', code: 'SC-BU-002', type: 'sub_county', parent_id: busiaId },

    { id: manyattaWardId, name: 'Manyatta', code: 'WD-EM-001', type: 'ward', parent_id: manyattaId },
    { id: njukiriWardId, name: 'Njukiri', code: 'WD-EM-002', type: 'ward', parent_id: manyattaId },
    { id: runyenjesWardId, name: 'Runyenjes', code: 'WD-EM-003', type: 'ward', parent_id: runyenjesId },
    { id: kagaariWardId, name: 'Kagaari', code: 'WD-EM-004', type: 'ward', parent_id: runyenjesId },

    { id: ziwaWardId, name: "Moi's Bridge", code: 'WD-UG-001', type: 'ward', parent_id: soyId },
    { id: kipsombaWardId, name: 'Ziwa', code: 'WD-UG-002', type: 'ward', parent_id: soyId },
    { id: kamagutWardId, name: 'Kamagut', code: 'WD-UG-003', type: 'ward', parent_id: turboId },
    { id: tapsagoiWardId, name: 'Tapsagoi', code: 'WD-UG-004', type: 'ward', parent_id: turboId },

    { id: busiaTownWardId, name: 'Busia Town', code: 'WD-BU-001', type: 'ward', parent_id: busiaTwnId },
    { id: mujengoWardId, name: 'Mujengo', code: 'WD-BU-002', type: 'ward', parent_id: busiaTwnId },
    { id: mundikaWardId, name: 'Mundika', code: 'WD-BU-003', type: 'ward', parent_id: butulaId },
    { id: nambiaWardId, name: 'Nambia', code: 'WD-BU-004', type: 'ward', parent_id: butulaId },
  ]);

  const hh1 = uuidv4(), hh2 = uuidv4(), hh3 = uuidv4(), hh4 = uuidv4(), hh5 = uuidv4(), hh6 = uuidv4();

  await knex('households').insert([
    { id: hh1, echis_household_id: 'ECH-HH-001', head_name: 'Peter Ochieng', head_phone: '+254722100001', village: 'Manyatta', ward: 'Manyatta', sub_county: 'Manyatta', county: 'EMBU', latitude: -0.0917, longitude: 34.768, member_count: 5, assigned_chw_id: chw1Id, status: 'active' },
    { id: hh2, echis_household_id: 'ECH-HH-002', head_name: 'Grace Akinyi', head_phone: '+254722100002', village: 'Njukiri', ward: 'Njukiri', sub_county: 'Manyatta', county: 'EMBU', latitude: -0.0925, longitude: 34.769, member_count: 3, assigned_chw_id: chw1Id, status: 'active' },
    { id: hh3, echis_household_id: 'ECH-HH-003', head_name: 'Samuel Kiprop', head_phone: '+254722100003', village: 'Ziwa', ward: 'Ziwa', sub_county: 'Soy', county: 'UASIN GISHU', latitude: 0.5214, longitude: 35.0942, member_count: 6, assigned_chw_id: chw1Id, status: 'active' },
    { id: hh4, echis_household_id: 'ECH-HH-004', head_name: 'Diana Chebet', head_phone: '+254722100004', village: 'Kamagut', ward: 'Kamagut', sub_county: 'Turbo', county: 'UASIN GISHU', latitude: 0.5833, longitude: 35.1167, member_count: 4, assigned_chw_id: chw2Id, status: 'active' },
    { id: hh5, echis_household_id: 'ECH-HH-005', head_name: 'James Omondi', head_phone: '+254722100005', village: 'Busia Town', ward: 'Busia Town', sub_county: 'Busia Township', county: 'BUSIA', latitude: 0.4614, longitude: 34.1123, member_count: 5, assigned_chw_id: chw2Id, status: 'active' },
    { id: hh6, echis_household_id: 'ECH-HH-006', head_name: 'Sarah Wanjala', head_phone: '+254722100006', village: 'Mundika', ward: 'Mundika', sub_county: 'Butula', county: 'BUSIA', latitude: 0.3489, longitude: 34.2111, member_count: 4, assigned_chw_id: chw2Id, status: 'active' },
  ]);

  const houseAssign = [hh1, hh1, hh1, hh2, hh2, hh3, hh3, hh3, hh4, hh4, hh5, hh5, hh5, hh6, hh6];
  const patientData = [
    { first: 'James', last: 'Ochieng', dob: '1985-03-15', gender: 'Male', phone: '+254722100011', village: 'Manyatta', ward: 'Manyatta', sub: 'Manyatta', county: 'EMBU' },
    { first: 'Sarah', last: 'Ochieng', dob: '1990-07-22', gender: 'Female', phone: '+254722100012', village: 'Manyatta', ward: 'Manyatta', sub: 'Manyatta', county: 'EMBU' },
    { first: 'Kevin', last: 'Ochieng', dob: '2015-11-08', gender: 'Male', phone: '', village: 'Manyatta', ward: 'Manyatta', sub: 'Manyatta', county: 'EMBU' },
    { first: 'Esther', last: 'Akinyi', dob: '1988-01-10', gender: 'Female', phone: '+254722100021', village: 'Njukiri', ward: 'Njukiri', sub: 'Manyatta', county: 'EMBU' },
    { first: 'David', last: 'Akinyi', dob: '1982-09-05', gender: 'Male', phone: '+254722100022', village: 'Njukiri', ward: 'Njukiri', sub: 'Manyatta', county: 'EMBU' },
    { first: 'Michael', last: 'Kiprop', dob: '1978-12-20', gender: 'Male', phone: '+254722100031', village: 'Ziwa', ward: 'Ziwa', sub: 'Soy', county: 'UASIN GISHU' },
    { first: 'Catherine', last: 'Kiprop', dob: '1983-04-15', gender: 'Female', phone: '+254722100032', village: 'Ziwa', ward: 'Ziwa', sub: 'Soy', county: 'UASIN GISHU' },
    { first: 'Baby', last: 'Kiprop', dob: '2023-06-01', gender: 'Female', phone: '', village: 'Ziwa', ward: 'Ziwa', sub: 'Soy', county: 'UASIN GISHU' },
    { first: 'Paul', last: 'Chebet', dob: '1992-08-30', gender: 'Male', phone: '+254722100041', village: 'Kamagut', ward: 'Kamagut', sub: 'Turbo', county: 'UASIN GISHU' },
    { first: 'Rose', last: 'Chebet', dob: '1995-02-14', gender: 'Female', phone: '+254722100042', village: 'Kamagut', ward: 'Kamagut', sub: 'Turbo', county: 'UASIN GISHU' },
    { first: 'John', last: 'Omondi', dob: '1987-06-21', gender: 'Male', phone: '+254722100051', village: 'Busia Town', ward: 'Busia Town', sub: 'Busia Township', county: 'BUSIA' },
    { first: 'Grace', last: 'Omondi', dob: '1991-09-12', gender: 'Female', phone: '+254722100052', village: 'Busia Town', ward: 'Busia Town', sub: 'Busia Township', county: 'BUSIA' },
    { first: 'Samuel', last: 'Wanjala', dob: '1980-03-08', gender: 'Male', phone: '+254722100061', village: 'Mundika', ward: 'Mundika', sub: 'Butula', county: 'BUSIA' },
    { first: 'Diana', last: 'Wanjala', dob: '1986-11-25', gender: 'Female', phone: '+254722100062', village: 'Mundika', ward: 'Mundika', sub: 'Butula', county: 'BUSIA' },
    { first: 'Ezekiel', last: 'Wanjala', dob: '2018-07-03', gender: 'Male', phone: '', village: 'Mundika', ward: 'Mundika', sub: 'Butula', county: 'BUSIA' },
  ];

  const patientIds = [];
  const chwAssign = [chw1Id, chw1Id, chw1Id, chw1Id, chw1Id, chw1Id, chw1Id, chw2Id, chw2Id, chw2Id, chw2Id, chw2Id, chw2Id, chw2Id, chw2Id];
  for (let i = 0; i < patientData.length; i++) {
    const pid = uuidv4();
    patientIds.push(pid);
    const p = patientData[i];
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
      ward: p.ward,
      sub_county: p.sub,
      county: p.county,
      assigned_chw_id: chwAssign[i],
      household_id: houseAssign[i],
      status: 'active',
      last_synced_at: new Date(),
    });
  }

  const encTypes = ['home_visit', 'follow_up', 'immunization', 'health_education', 'screening'];
  for (let i = 0; i < patientIds.length; i++) {
    const numEncounters = 2 + Math.floor(Math.random() * 4);
    const chw = chwAssign[i];
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
        latitude: parseFloat((0.521 + Math.random() * 0.005).toFixed(7)),
        longitude: parseFloat((35.094 + Math.random() * 0.005).toFixed(7)),
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
  const sampleHouseholds = [hh1, hh3, hh5];
  for (let i = 0; i < 20; i++) {
    const chw = i < 10 ? chw1Id : chw2Id;
    const actDate = new Date(2025, 0, 1);
    actDate.setDate(actDate.getDate() + Math.floor(Math.random() * 180));
    await knex('chw_activities').insert({
      id: uuidv4(),
      chw_id: chw,
      activity_type: actTypes[Math.floor(Math.random() * actTypes.length)],
      patient_id: patientIds[Math.floor(Math.random() * patientIds.length)],
      household_id: sampleHouseholds[Math.floor(Math.random() * sampleHouseholds.length)],
      visit_date: actDate.toISOString(),
      duration_minutes: String(15 + Math.floor(Math.random() * 60)),
      notes: 'Routine visit',
      assessments: JSON.stringify({ nutrition_status: Math.random() > 0.5 ? 'normal' : 'at_risk', sanitation: Math.random() > 0.3 ? 'improved' : 'unimproved', water_source: Math.random() > 0.4 ? 'safe' : 'unsafe' }),
      latitude: parseFloat((0.521 + Math.random() * 0.005).toFixed(7)),
      longitude: parseFloat((35.094 + Math.random() * 0.005).toFixed(7)),
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
