const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  location: { type: String, required: true },
  area: { type: Number, required: true },
  propertyType: { type: String, enum: ['house', 'flat', 'land', 'shop', 'villa'], required: true },
  bedrooms: { type: Number, required: true },
  bathrooms: { type: Number, required: true },
  amenities: { type: String, required: true },
  landmarks: { type: String, required: true },
  images: [String],
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'sold'], default: 'pending' },
  interestCount: { type: Number, default: 0 },
  postedAt: { type: Date, default: Date.now },
  approvedAt: Date,
  soldAt: Date
});

module.exports = mongoose.model('Property', propertySchema);