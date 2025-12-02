import mongoose, { Schema, model, models } from "mongoose";

const VariantSchema = new Schema({
  size: { type: String, required: true },
  price: { type: Number, required: true },
  sku: String,
  stock: { type: Number, default: 0 },
});

const ProductSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  images: [{ type: String }],
  category: { type: mongoose.Types.ObjectId, ref: 'Category' },
  variants: [VariantSchema],
  featured: { type: Boolean, default: false }, 
}, {
  timestamps: true,
});

export const Product = models.Product || model('Product', ProductSchema);