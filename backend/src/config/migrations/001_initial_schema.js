exports.up = function (knex) {
  return knex.schema
    .createTable('users', (table) => {
      table.text('id').primary();
      table.string('username', 100).notNullable().unique();
      table.string('email', 255).notNullable().unique();
      table.string('password_hash', 255).notNullable();
      table.string('first_name', 100).notNullable();
      table.string('last_name', 100).notNullable();
      table.string('role', 20).notNullable().defaultTo('chw');
      table.string('phone', 20);
      table.text('assigned_region_id');
      table.boolean('is_active').defaultTo(true);
      table.timestamp('last_login_at');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      table.index(['role', 'is_active']);
    })
    .createTable('refresh_tokens', (table) => {
      table.text('id').primary();
      table.text('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.string('token', 500).notNullable();
      table.timestamp('expires_at').notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.index(['user_id', 'token']);
    })
    .createTable('regions', (table) => {
      table.text('id').primary();
      table.string('name', 200).notNullable();
      table.string('code', 50).notNullable().unique();
      table.string('type', 50).notNullable();
      table.text('parent_id').references('id').inTable('regions');
      table.text('boundary');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    })
    .createTable('patients', (table) => {
      table.text('id').primary();
      table.string('openmrs_uuid', 100).unique();
      table.string('echis_id', 100).unique();
      table.string('national_id', 50).unique();
      table.string('first_name', 100).notNullable();
      table.string('last_name', 100).notNullable();
      table.string('middle_name', 100);
      table.date('date_of_birth').notNullable();
      table.string('gender', 10).notNullable();
      table.string('phone', 20);
      table.string('alt_phone', 20);
      table.text('address');
      table.string('village', 100);
      table.string('ward', 100);
      table.string('sub_county', 100);
      table.string('county', 100);
      table.text('assigned_chw_id').references('id').inTable('users');
      table.text('household_id');
      table.string('status', 20).defaultTo('active');
      table.text('metadata');
      table.timestamp('last_synced_at');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      table.index(['openmrs_uuid', 'echis_id', 'national_id']);
      table.index(['assigned_chw_id', 'status']);
      table.index(['village', 'ward', 'sub_county', 'county']);
    })
    .createTable('households', (table) => {
      table.text('id').primary();
      table.string('echis_household_id', 100).unique();
      table.string('head_name', 200).notNullable();
      table.string('head_phone', 20);
      table.string('village', 100);
      table.string('ward', 100);
      table.string('sub_county', 100);
      table.string('county', 100);
      table.string('hamlet', 100);
      table.string('landmark', 200);
      table.decimal('latitude', 10, 7);
      table.decimal('longitude', 10, 7);
      table.integer('member_count').defaultTo(0);
      table.text('assigned_chw_id').references('id').inTable('users');
      table.string('status', 20).defaultTo('active');
      table.text('metadata');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      table.index(['assigned_chw_id', 'status']);
      table.index(['village', 'ward']);
    })
    .createTable('encounters', (table) => {
      table.text('id').primary();
      table.string('openmrs_encounter_uuid', 100).unique();
      table.text('patient_id').notNullable().references('id').inTable('patients').onDelete('CASCADE');
      table.text('chw_id').references('id').inTable('users');
      table.string('encounter_type', 100).notNullable();
      table.timestamp('encounter_datetime').notNullable();
      table.string('location', 200);
      table.decimal('latitude', 10, 7);
      table.decimal('longitude', 10, 7);
      table.text('observations');
      table.string('sync_status', 20).defaultTo('pending');
      table.timestamp('last_synced_at');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      table.index(['patient_id', 'encounter_datetime']);
      table.index(['chw_id', 'encounter_type']);
      table.index('sync_status');
    })
    .createTable('sync_log', (table) => {
      table.text('id').primary();
      table.string('entity_type', 50).notNullable();
      table.text('entity_id');
      table.string('direction', 50).notNullable();
      table.string('status', 20).notNullable().defaultTo('pending');
      table.text('request_payload');
      table.text('response_payload');
      table.text('error_message');
      table.integer('attempt_count').defaultTo(0);
      table.timestamp('last_attempt_at');
      table.timestamp('completed_at');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.index(['entity_type', 'status']);
      table.index(['direction', 'status']);
      table.index('created_at');
    })
    .createTable('chw_activities', (table) => {
      table.text('id').primary();
      table.text('chw_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.string('activity_type', 100).notNullable();
      table.text('patient_id').references('id').inTable('patients');
      table.text('household_id').references('id').inTable('households');
      table.timestamp('visit_date').notNullable();
      table.string('duration_minutes', 10);
      table.text('notes');
      table.text('assessments');
      table.decimal('latitude', 10, 7);
      table.decimal('longitude', 10, 7);
      table.string('sync_status', 20).defaultTo('pending');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      table.index(['chw_id', 'visit_date']);
      table.index(['activity_type', 'visit_date']);
      table.index('sync_status');
    })
    .createTable('audit_log', (table) => {
      table.text('id').primary();
      table.text('user_id').references('id').inTable('users');
      table.string('action', 100).notNullable();
      table.string('entity_type', 50);
      table.text('entity_id');
      table.text('details');
      table.string('ip_address', 45);
      table.string('user_agent', 500);
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.index(['user_id', 'action']);
      table.index('created_at');
      table.index('action');
    })
    .createTable('system_config', (table) => {
      table.string('key', 100).primary();
      table.text('value').notNullable();
      table.text('description');
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists('audit_log')
    .dropTableIfExists('chw_activities')
    .dropTableIfExists('sync_log')
    .dropTableIfExists('encounters')
    .dropTableIfExists('patients')
    .dropTableIfExists('households')
    .dropTableIfExists('refresh_tokens')
    .dropTableIfExists('regions')
    .dropTableIfExists('users')
    .dropTableIfExists('system_config');
};
