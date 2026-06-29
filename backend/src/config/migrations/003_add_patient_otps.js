exports.up = function (knex) {
  return knex.schema.createTable('patient_otps', (table) => {
    table.text('id').primary();
    table.string('phone', 20).notNullable();
    table.string('otp_hash', 255).notNullable();
    table.timestamp('expires_at').notNullable();
    table.boolean('used').defaultTo(false);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.index(['phone', 'used']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('patient_otps');
};
