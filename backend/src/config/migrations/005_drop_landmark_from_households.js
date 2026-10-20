exports.up = async function (knex) {
  await knex.schema.raw('ALTER TABLE households DROP COLUMN landmark');
};

exports.down = async function (knex) {
  await knex.schema.raw('ALTER TABLE households ADD COLUMN landmark varchar(200)');
};

exports.config = { transaction: false };
