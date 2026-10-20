exports.up = async function (knex) {
  await knex.schema.raw('ALTER TABLE households DROP COLUMN hamlet');
};

exports.down = async function (knex) {
  await knex.schema.raw('ALTER TABLE households ADD COLUMN hamlet varchar(100)');
};

exports.config = { transaction: false };
