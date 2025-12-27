const express = require('express');
const { adminAuth } = require('../middleware/auth');
const Property = require('../models/Property');
const User = require('../models/User');
const Interest = require('../models/Interest');

const router = express.Router();

// Get all pending properties
router.get('/pending-properties', adminAuth, async (req, res) => {
  try {
    console.log('🔍 ADMIN: Fetching pending properties...');
    const properties = await Property.find({ status: 'pending' })
      .populate('seller', 'name email phone')
      .sort({ postedAt: -1 });
    
    console.log(`✅ ADMIN: Found ${properties.length} pending properties`);
    res.json(properties);
  } catch (error) {
    console.error('❌ ADMIN: Error fetching pending properties:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Approve property
router.put('/properties/:id/approve', adminAuth, async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'approved',
        approvedAt: new Date()
      },
      { new: true }
    ).populate('seller', 'name email');

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    res.json(property);
  } catch (error) {
    console.error('Error approving property:', error);
    res.status(500).send('Server error');
  }
});

// Reject property
router.put('/properties/:id/reject', adminAuth, async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    );

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    res.json(property);
  } catch (error) {
    console.error('Error rejecting property:', error);
    res.status(500).send('Server error');
  }
});

// Mark property as sold
router.put('/properties/:id/sold', adminAuth, async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'sold',
        soldAt: new Date()
      },
      { new: true }
    ).populate('seller', 'name');

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    res.json(property);
  } catch (error) {
    console.error('Error marking property as sold:', error);
    res.status(500).send('Server error');
  }
});

// Get all users
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).send('Server error');
  }
});

// Make user admin
router.put('/users/:id/make-admin', adminAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isVerified: true },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error making user admin:', error);
    res.status(500).send('Server error');
  }
});

// Get all interests
router.get('/interests', adminAuth, async (req, res) => {
  try {
    const interests = await Interest.find()
      .populate('buyer', 'name email phone')
      .populate('property')
      .sort({ createdAt: -1 });
    res.json(interests);
  } catch (error) {
    console.error('Error fetching interests:', error);
    res.status(500).send('Server error');
  }
});

// Update interest status
router.put('/interests/:id', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const interest = await Interest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
    .populate('buyer', 'name email phone')
    .populate('property');

    if (!interest) {
      return res.status(404).json({ message: 'Interest not found' });
    }

    res.json(interest);
  } catch (error) {
    console.error('Error updating interest status:', error);
    res.status(500).send('Server error');
  }
});

// Get sold properties
router.get('/sold-properties', adminAuth, async (req, res) => {
  try {
    const properties = await Property.find({ status: 'sold' })
      .populate('seller', 'name')
      .sort({ soldAt: -1 });
    res.json(properties);
  } catch (error) {
    console.error('Error fetching sold properties:', error);
    res.status(500).send('Server error');
  }
});

module.exports = router;


