const { db } = require('../models');
const { v4: uuidv4 } = require('uuid');

const paymentService = {
  async getSummary(user = null) {
    const isChw = user && user.role === 'chw';
    const query = db.payments();
    if (isChw) query.where('chw_id', user.id);

    const [cashResult, mpesaResult, totalResult, recentPayments] = await Promise.all([
      query.clone().where({ payment_method: 'cash' }).sum('amount as total').first(),
      query.clone().where({ payment_method: 'mpesa' }).sum('amount as total').first(),
      query.clone().sum('amount as total').count('id as count').first(),
      query.clone().orderBy('payment_date', 'desc').limit(5),
    ]);

    return {
      cashTotal: parseFloat(cashResult?.total || 0),
      mpesaTotal: parseFloat(mpesaResult?.total || 0),
      grandTotal: parseFloat(totalResult?.total || 0),
      paymentCount: parseInt(totalResult?.count || 0),
      recentPayments,
    };
  },

  async list(filters = {}, user = null) {
    const { page = 1, limit = 20, payment_method, startDate, endDate } = filters;
    let query = db.payments()
      .select(
        'payments.*',
        db.knex.raw("(p.first_name || ' ' || p.last_name) as patient_name"),
        db.knex.raw("(u.first_name || ' ' || u.last_name) as chw_name")
      )
      .leftJoin('patients as p', 'payments.patient_id', 'p.id')
      .leftJoin('users as u', 'payments.chw_id', 'u.id')
      .orderBy('payments.payment_date', 'desc');

    if (user && user.role === 'chw') query = query.where('payments.chw_id', user.id);
    if (payment_method) query = query.where('payments.payment_method', payment_method);
    if (startDate) query = query.where('payments.payment_date', '>=', startDate);
    if (endDate) query = query.where('payments.payment_date', '<=', endDate);

    const offset = (page - 1) * limit;
    const [rows, totalResult] = await Promise.all([
      query.clone().limit(limit).offset(offset),
      db.payments().count('id as count').first(),
    ]);

    return { data: rows, total: parseInt(totalResult.count), page, limit };
  },

  async create(data, userId) {
    const payment = {
      id: uuidv4(),
      patient_id: data.patient_id || null,
      chw_id: userId,
      amount: data.amount,
      payment_method: data.payment_method || 'cash',
      currency: data.currency || 'KES',
      description: data.description || null,
      category: data.category || null,
      payment_date: data.payment_date || new Date().toISOString().split('T')[0],
    };
    await db.payments().insert(payment);
    return payment;
  },
};

module.exports = paymentService;
