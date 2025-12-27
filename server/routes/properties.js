const express = require('express');
const multer = require('multer');
const path = require('path');
const { auth } = require('../middleware/auth');
const Property = require('../models/Property');
const Interest = require('../models/Interest');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });

// Get all approved properties
router.get('/', async (req, res) => {
  try {
    console.log('📋 Fetching approved properties...');
    const properties = await Property.find({ status: 'approved' })
      .populate('seller', 'name')
      .sort({ postedAt: -1 });
    console.log(`✅ Found ${properties.length} approved properties`);
    res.json(properties);
  } catch (error) {
    console.error('❌ Error fetching properties:', error);
    res.status(500).send('Server error');
  }
});

// Get single property
router.get('/:id', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('seller', 'name');
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    res.json(property);
  } catch (error) {
    console.error('❌ Error fetching property:', error);
    res.status(500).send('Server error');
  }
});

// Create property
router.post('/', auth, upload.array('images', 10), async (req, res) => {
  try {
    console.log('🏠 New property submission received');
    
    const {
      title,
      description,
      price,
      location,
      area,
      propertyType,
      bedrooms,
      bathrooms,
      amenities,
      landmarks
    } = req.body;

    // Validation
    if (!title || !description || !price || !location || !area || !propertyType || !bedrooms || !bathrooms || !amenities || !landmarks) {
      console.log('❌ Validation failed - missing fields');
      return res.status(400).json({ message: 'All fields are required' });
    }

    const images = req.files ? req.files.map(file => file.filename) : [];

    const property = new Property({
      title: title.trim(),
      description: description.trim(),
      price: parseInt(price),
      location: location.trim(),
      area: parseInt(area),
      propertyType: propertyType.trim(),
      bedrooms: parseInt(bedrooms),
      bathrooms: parseInt(bathrooms),
      amenities: amenities.trim(),
      landmarks: landmarks.trim(),
      images,
      seller: req.user.id,
      status: 'pending'
    });

    console.log('💾 Saving property to database...');
    await property.save();
    
    // Populate seller info before sending response
    await property.populate('seller', 'name');
    
    console.log('✅ Property saved successfully:', property._id);
    res.json(property);
  } catch (error) {
    console.error('❌ Property submission error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Express interest in property
router.post('/:id/interest', auth, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check if already interested
    const existingInterest = await Interest.findOne({
      buyer: req.user.id,
      property: req.params.id
    });

    if (existingInterest) {
      return res.status(400).json({ message: 'You have already shown interest in this property' });
    }

    const interest = new Interest({
      buyer: req.user.id,
      property: req.params.id,
      message: req.body.message || 'I am interested in this property'
    });

    await interest.save();

    // Update interest count
    property.interestCount += 1;
    await property.save();

    res.json(interest);
  } catch (error) {
    console.error('❌ Error showing interest:', error);
    res.status(500).send('Server error');
  }
});

// Get user's properties
router.get('/user/my-properties', auth, async (req, res) => {
  try {
    console.log('👤 Fetching user properties for:', req.user.id);
    const properties = await Property.find({ seller: req.user.id }).sort({ postedAt: -1 });
    console.log(`✅ Found ${properties.length} properties for user`);
    res.json(properties);
  } catch (error) {
    console.error('❌ Error fetching user properties:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's interests
router.get('/user/my-interests', auth, async (req, res) => {
  try {
    console.log('💖 Fetching user interests for:', req.user.id);
    const interests = await Interest.find({ buyer: req.user.id })
      .populate('property')
      .sort({ createdAt: -1 });
    console.log(`✅ Found ${interests.length} interests for user`);
    res.json(interests);
  } catch (error) {
    console.error('❌ Error fetching user interests:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark property as sold (owner)
router.put('/:id/mark-sold', auth, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Only the owner can mark as sold
    if (property.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You are not allowed to mark this property as sold' });
    }

    // Only approved properties can be sold
    if (property.status !== 'approved') {
      return res.status(400).json({ message: 'Only approved properties can be marked as sold' });
    }

    property.status = 'sold';
    property.soldAt = new Date();
    await property.save();

    res.json(property);
  } catch (error) {
    console.error('Error marking property as sold:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


module.exports = router;