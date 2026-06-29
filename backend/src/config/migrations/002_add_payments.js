exports.up = function (knex) {
  return knex.schema.createTable('payments', (table) => {
    table.text('id').primary();
    table.text('patient_id').references('id').inTable('patients').onDelete('SET NULL');
    table.text('chw_id').references('id').inTable('users').onDelete('SET NULL');
    table.decimal('amount', 12, 2).notNullable();
    table.string('payment_method', 20).notNullable().defaultTo('cash');
    table.string('currency', 10).defaultTo('KES');
    table.text('description');
    table.string('category', 100);
    table.date('payment_date').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.index(['payment_method', 'payment_date']);
    table.index('chw_id');
    table.index('patient_id');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('payments');
};
