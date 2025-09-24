const Tenant = require('../models/Tenant');
const Note = require('../models/Note');

// @desc    Upgrade tenant subscription to Pro
// @route   POST /api/tenants/:slug/upgrade
// @access  Private (Admin only)
const upgradeTenant = async (req, res) => {
  try {
    const { slug } = req.params;

    // Find the tenant
    const tenant = await Tenant.findOne({ slug });
    
    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found'
      });
    }

    // Check if tenant is already on Pro plan
    if (tenant.plan === 'pro') {
      return res.status(400).json({
        success: false,
        message: 'Tenant is already on Pro plan'
      });
    }

    // Update to Pro plan
    tenant.plan = 'pro';
    tenant.maxNotes = -1; // Unlimited
    await tenant.save();

    res.json({
      success: true,
      message: 'Tenant successfully upgraded to Pro plan',
      data: {
        tenant: {
          id: tenant._id,
          slug: tenant.slug,
          name: tenant.name,
          plan: tenant.plan,
          maxNotes: tenant.maxNotes === -1 ? 'unlimited' : tenant.maxNotes
        }
      }
    });
  } catch (error) {
    console.error('Upgrade tenant error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during tenant upgrade'
    });
  }
};

// @desc    Get tenant information
// @route   GET /api/tenants/:slug
// @access  Private (same tenant only)
const getTenant = async (req, res) => {
  try {
    const tenant = req.tenant;
    const noteCount = await Note.countByTenant(tenant._id);

    res.json({
      success: true,
      data: {
        tenant: {
          id: tenant._id,
          slug: tenant.slug,
          name: tenant.name,
          plan: tenant.plan,
          maxNotes: tenant.maxNotes === -1 ? 'unlimited' : tenant.maxNotes,
          currentNotes: noteCount,
          canCreateNotes: await tenant.canCreateNote(noteCount)
        }
      }
    });
  } catch (error) {
    console.error('Get tenant error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching tenant information'
    });
  }
};

module.exports = {
  upgradeTenant,
  getTenant
};