import { model, Schema, models } from "mongoose";

const CategorySchema = new Schema({
  name: { type: String, required: true, unique: true },
  parent: { type: Schema.Types.ObjectId, ref: 'Category', index: true },
});

export const Category = models?.Category || model('Category', CategorySchema);