import mongoose, { Schema, model, models } from "mongoose";

const OrderSchema = new mongoose.Schema({
  line_items: Object,
  name: String,
  email: String,
  city: String,
  province: String,
  postalCode: String,
  streetAddress: String,
  country: String,
  phone: String,
  paid: { type: Boolean, default: false },
  currency: { type: String, default: 'CAD' },
}, {
  timestamps: true,
});

export const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);