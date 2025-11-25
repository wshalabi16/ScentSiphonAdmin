import { model, Schema, models } from "mongoose";

const ProductSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  images: [{ type: String }],
  category: { type: Schema.Types.ObjectId, ref: 'Category' },
  variants: [{
    size: { type: String, required: true },
    price: { type: Number, required: true },
    sku: { type: String },
    stock: { type: Number, default: 0 },
  }],
}, {
  timestamps: true,
});

export const Product = models?.Product || model('Product', ProductSchema);