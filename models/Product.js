import mongoose, { Schema, model, models } from "mongoose";

const VariantSchema = new Schema({
  size: { type: String, required: true },
  price: { type: Number, required: true },
  sku: String,
  stock: { type: Number, default: 0 },
});

const ProductSchema = new Schema({
  title: { type: String, required: true, index: true },
  description: String,
  price: { type: Number, required: true },
  images: [{ type: String }],
  category: { type: mongoose.Types.ObjectId, ref: 'Category', index: true },
  variants: [VariantSchema],
  featured: { type: Boolean, default: false, index: true },
}, {
  timestamps: true,
});

// Compound indexes for common query patterns
ProductSchema.index({ category: 1, createdAt: -1 }); // Products by category, newest first
ProductSchema.index({ featured: 1, createdAt: -1 }); // Featured products, newest first

export const Product = models.Product || model('Product', ProductSchema);