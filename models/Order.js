import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  line_items: Object,
  name: String,
  email: { type: String, index: true },
  city: String,
  province: String,
  postalCode: String,
  streetAddress: String,
  country: String,
  phone: String,
  paid: { type: Boolean, default: false, index: true },
  currency: { type: String, default: 'CAD' },
  stripeEventId: { type: String, unique: true, sparse: true, index: true },  // For webhook idempotency
  processedAt: Date,  // When webhook was processed
  shipped: { type: Boolean, default: false, index: true },
  delivered: { type: Boolean, default: false, index: true },
  shippedAt: Date,
  deliveredAt: Date,
  trackingNumber: String
}, {
  timestamps: true,
});

// Compound index for common query pattern: orders by email, newest first
OrderSchema.index({ email: 1, createdAt: -1 });

export const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);
