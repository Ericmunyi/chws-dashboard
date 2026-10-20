exports.up = async function (knex) {
  const facility = await knex('referral_facilities').first();
  if (facility) {
    await knex('users').where({ username: 'admin' }).update({ facility_id: facility.id });
  }
};

exports.down = async function (knex) {
  await knex('users').where({ username: 'admin' }).update({ facility_id: null });
};
