exports.up = function (knex) {
  return knex.schema
    .createTable('referral_facilities', (table) => {
      table.text('id').primary();
      table.string('name', 255).notNullable();
      table.string('type', 100).notNullable();
      table.string('level', 50);
      table.string('county', 100).notNullable();
      table.string('sub_county', 100);
      table.string('ward', 100);
      table.string('phone', 20);
      table.text('address');
      table.boolean('is_active').defaultTo(true);
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      table.index(['county', 'is_active']);
      table.index('name');
    });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('referral_facilities');
};
