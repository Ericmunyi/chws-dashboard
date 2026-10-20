exports.up = function (knex) {
  return knex.schema
    .createTable('departments', (table) => {
      table.text('id').primary();
      table.string('name', 100).notNullable().unique();
      table.string('code', 20).notNullable().unique();
      table.text('description');
      table.boolean('is_active').notNullable().defaultTo(true);
      table.integer('display_order').notNullable().defaultTo(0);
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      table.index(['is_active']);
    })
    .then(() => {
      return knex.schema.alterTable('encounters', (table) => {
        table.text('department_id').references('id').inTable('departments').onDelete('SET NULL');
        table.index(['department_id']);
      });
    });
};

exports.down = function (knex) {
  return knex.schema
    .alterTable('encounters', (table) => {
      table.dropColumn('department_id');
    })
    .then(() => knex.schema.dropTableIfExists('departments'));
};
