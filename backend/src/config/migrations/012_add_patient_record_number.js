exports.up = async function (knex) {
  const hasColumn = await knex.schema.hasColumn('patients', 'record_number');
  if (!hasColumn) {
    await knex.schema.alterTable('patients', (table) => {
      table.string('record_number', 20);
      table.unique('record_number');
    });
  }

  const patients = await knex('patients')
    .select('id', 'record_number')
    .orderBy('created_at', 'asc');

  let seq = 0;
  for (const p of patients) {
    seq += 1;
    if (!p.record_number) {
      const recordNumber = `PT-${String(seq).padStart(4, '0')}`;
      await knex('patients').where({ id: p.id }).update({ record_number: recordNumber });
    }
  }
};

exports.down = async function (knex) {
  await knex.schema.alterTable('patients', (table) => {
    table.dropColumn('record_number');
  });
};
