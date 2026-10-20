const { v4: uuidv4 } = require('uuid');

exports.seed = async function (knex) {
  await knex('department_queue').del();
  await knex('departments').del();

  const departments = [
    { name: 'Outpatient Department (OPD)', code: 'OPD', description: 'General outpatient consultations and treatment', display_order: 1 },
    { name: 'Triage', code: 'TRI', description: 'Initial assessment, vitals and patient prioritisation', display_order: 2 },
    { name: 'Maternity / Obstetrics & Gynaecology', code: 'MAT', description: 'Antenatal, labour, delivery and gynaecology care', display_order: 3 },
    { name: 'Pediatrics', code: 'PED', description: 'Care for infants, children and adolescents', display_order: 4 },
    { name: 'Surgery', code: 'SUR', description: 'Surgical consultations and theatre services', display_order: 5 },
    { name: 'Orthopedics', code: 'ORT', description: 'Bone, joint and musculoskeletal care', display_order: 6 },
    { name: 'Ophthalmology', code: 'OPH', description: 'Eye care and vision services', display_order: 7 },
    { name: 'Ear, Nose & Throat (ENT)', code: 'ENT', description: 'ENT consultations and procedures', display_order: 8 },
    { name: 'Dental', code: 'DEN', description: 'Dental and oral health services', display_order: 9 },
    { name: 'Mental Health', code: 'MHC', description: 'Psychiatric and counselling services', display_order: 10 },
    { name: 'Laboratory', code: 'LAB', description: 'Diagnostic laboratory and pathology services', display_order: 11 },
    { name: 'Radiology / Imaging', code: 'RAD', description: 'X-ray, ultrasound and imaging services', display_order: 12 },
    { name: 'Pharmacy', code: 'PHA', description: 'Medication dispensing and pharmaceutical care', display_order: 13 },
    { name: 'Nutrition / Dietetics', code: 'NUT', description: 'Nutrition assessment and dietary counselling', display_order: 14 },
    { name: 'Chronic Care Clinic', code: 'CHR', description: 'Long-term conditions: diabetes, hypertension, HIV, TB', display_order: 15 },
  ];

  await knex('departments').insert(
    departments.map((d) => ({
      id: uuidv4(),
      name: d.name,
      code: d.code,
      description: d.description,
      is_active: true,
      display_order: d.display_order,
    }))
  );
};
