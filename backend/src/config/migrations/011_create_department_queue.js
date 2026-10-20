exports.up = function (knex) {
  return knex.schema.createTable('department_queue', (table) => {
    table.text('id').primary();
    table.text('department_id').notNullable().references('id').inTable('departments').onDelete('CASCADE');
    table.text('patient_id').notNullable().references('id').inTable('patients').onDelete('CASCADE');
    table.text('encounter_id').references('id').inTable('encounters').onDelete('SET NULL');
    table.string('queue_date', 10).notNullable();
    table.integer('queue_number').notNullable();
    table.string('status', 20).notNullable().defaultTo('waiting'); // waiting | in_service | completed | skipped | cancelled
    table.string('priority', 10).notNullable().defaultTo('normal'); // normal | urgent | emergency
    table.string('reason', 255);
    table.text('notes');
    table.timestamp('queued_at').defaultTo(knex.fn.now());
    table.timestamp('called_at');
    table.timestamp('completed_at');
    table.text('queued_by').references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.index(['department_id', 'queue_date']);
    table.index(['queue_date']);
    table.index(['status']);
    table.unique(['department_id', 'queue_date', 'queue_number']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('department_queue');
};
