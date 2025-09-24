const express = require('express');
const { upgradeTenant, getTenant } = require('../controllers/tenantController');
const { authenticate, requireAdmin, requireTenant } = require('../middleware/auth');
const { tenantSlugValidation } = require('../validators/validators');
const { handleValidationErrors } = require('../middleware/errorHandler');

const router = express.Router();

// @route   POST /api/tenants/:slug/upgrade
router.post(
  '/:slug/upgrade',
  tenantSlugValidation,
  handleValidationErrors,
  authenticate,
  requireTenant(),
  requireAdmin,
  upgradeTenant
);

// @route   GET /api/tenants/:slug
router.get(
  '/:slug',
  tenantSlugValidation,
  handleValidationErrors,
  authenticate,
  requireTenant(),
  getTenant
);

module.exports = router;