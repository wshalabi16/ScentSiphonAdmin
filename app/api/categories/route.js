import { Category } from "@/models/Category";
import { mongooseConnect } from "@/lib/mongoose";
import { NextResponse } from 'next/server';

export async function POST(request) {
  await mongooseConnect();
  const { name, parentCategory } = await request.json();
  const categoryData = { name };
  if (parentCategory) {
    categoryData.parent = parentCategory;
  }
  const categoryDoc = await Category.create(categoryData);
  return NextResponse.json(categoryDoc);
}

export async function GET() {
  await mongooseConnect();
  const categories = await Category.find().populate('parent');
  return NextResponse.json(categories);
}