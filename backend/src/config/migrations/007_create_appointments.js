exports.up = function (knex) {
  return knex.schema
    .createTable('appointments', (table) => {
      table.text('id').primary();
      table.text('patient_id').notNullable().references('id').inTable('patients').onDelete('CASCADE');
      table.text('facility_id').notNullable().references('id').inTable('referral_facilities').onDelete('CASCADE');
      table.date('appointment_date').notNullable();
      table.string('appointment_time', 5).notNullable();
      table.text('reason');
      table.string('status', 20).notNullable().defaultTo('scheduled');
      table.text('notes');
      table.text('created_by').notNullable().references('id').inTable('users');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      table.index(['facility_id', 'appointment_date']);
      table.index(['patient_id']);
      table.index(['status']);
      table.unique(['facility_id', 'appointment_date', 'appointment_time']);
    });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('appointments');
};
