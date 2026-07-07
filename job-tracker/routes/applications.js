const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const authMiddleware = require('../middleware/auth');

// Apply authentication to ALL routes in this file
// This means user MUST be logged in to use any of these routes
router.use(authMiddleware);

// ─────────────────────────────────────────────────────
// GET STATISTICS
// GET /api/applications/stats
// IMPORTANT: This MUST come BEFORE the /:id route!
// ─────────────────────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    // Get all applications for this user
    const applications = await Application.find({ userId: req.userId });

    // Count by status
    const stats = {
      total: applications.length,
      applied: applications.filter(app => app.status === 'Applied').length,
      interview: applications.filter(app => app.status === 'Interview').length,
      offer: applications.filter(app => app.status === 'Offer').length,
      rejected: applications.filter(app => app.status === 'Rejected').length
    };

    res.status(200).json({ stats });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error, please try again' });
  }
});

// ─────────────────────────────────────────────────────
// 1. CREATE NEW APPLICATION
// POST /api/applications
// ─────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { companyName, position, applicationUrl, status, location, salaryRange, notes, followUpDate } = req.body;

    // Validation: Must have at least company name and position
    if (!companyName || !position) {
      return res.status(400).json({ message: 'Company name and position are required' });
    }

    // Create new application linked to the logged-in user
    const newApplication = new Application({
      userId: req.userId,  // This comes from authMiddleware
      companyName,
      position,
      applicationUrl: applicationUrl || '',
      status: status || 'Applied',
      location: location || '',
      salaryRange: salaryRange || '',
      notes: notes || '',
      followUpDate: followUpDate || null
    });

    await newApplication.save();

    res.status(201).json({
      message: 'Application added successfully!',
      application: newApplication
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error, please try again' });
  }
});


// ─────────────────────────────────────────────────────
// 2. GET ALL APPLICATIONS (with filtering & search)
// GET /api/applications
// Query params:
//   ?status=Interview  (filter by status)
//   ?search=google     (search in company name or position)
// ─────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    // Build query object
    const query = { userId: req.userId };

    // Filter by status if provided
    // Example: /api/applications?status=Interview
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Search in company name or position
    // Example: /api/applications?search=google
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i'); // 'i' = case insensitive
      query.$or = [
        { companyName: searchRegex },
        { position: searchRegex }
      ];
    }

    // Find applications matching the query
    const applications = await Application.find(query)
      .sort({ dateApplied: -1 });

    res.status(200).json({
      count: applications.length,
      applications
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error, please try again' });
  }
});


// ─────────────────────────────────────────────────────
// 3. GET SINGLE APPLICATION BY ID
// GET /api/applications/:id
// ─────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    // Check if application exists
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check if this application belongs to the logged-in user (security!)
    if (application.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to view this application' });
    }

    res.status(200).json({ application });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error, please try again' });
  }
});


// ─────────────────────────────────────────────────────
// 4. UPDATE APPLICATION
// PUT /api/applications/:id
// ─────────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    // Check if application exists
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Security: Only owner can update
    if (application.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to update this application' });
    }

    // Update fields (only what was sent in the request)
    const { companyName, position, applicationUrl, status, location, salaryRange, notes, followUpDate } = req.body;

    if (companyName) application.companyName = companyName;
    if (position) application.position = position;
    if (applicationUrl !== undefined) application.applicationUrl = applicationUrl;
    if (status) application.status = status;
    if (location !== undefined) application.location = location;
    if (salaryRange !== undefined) application.salaryRange = salaryRange;
    if (notes !== undefined) application.notes = notes;
    if (followUpDate !== undefined) application.followUpDate = followUpDate;

    await application.save();

    res.status(200).json({
      message: 'Application updated successfully!',
      application
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error, please try again' });
  }
});


// ─────────────────────────────────────────────────────
// 5. DELETE APPLICATION
// DELETE /api/applications/:id
// ─────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    // Check if application exists
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Security: Only owner can delete
    if (application.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this application' });
    }

    await Application.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Application deleted successfully!' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error, please try again' });
  }
});


module.exports = router;