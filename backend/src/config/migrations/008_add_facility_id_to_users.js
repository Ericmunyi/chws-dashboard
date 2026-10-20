exports.up = function (knex) {
  return knex.schema.table('users', (table) => {
    table.text('facility_id');
    table.index('facility_id');
  });
};

exports.down = function (knex) {
  return knex.schema.table('users', (table) => {
    table.dropIndex('facility_id');
    table.dropColumn('facility_id');
  });
};
