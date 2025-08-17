// routes/alerts.js
const express = require('express');
const { getLowStockAlerts } = require('../controllers/alertsController');

const router = express.Router();

/**
 * GET /api/companies/:company_id/alerts/low-stock
 * Returns low-stock alerts for a company
 */
router.get('/api/companies/:company_id/alerts/low-stock', getLowStockAlerts);

module.exports = router;