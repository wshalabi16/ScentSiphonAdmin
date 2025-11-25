import { Category } from "@/models/Category";
import { mongooseConnect } from "@/lib/mongoose";
import { NextResponse } from 'next/server';

export async function POST(request) {
  await mongooseConnect();
  const { name, parentCategory } = await request.json();
  const categoryDoc = await Category.create({
    name,
    parent: parentCategory || undefined,
  });
  return NextResponse.json(categoryDoc);
}

export async function GET() {
  await mongooseConnect();
  const categories = await Category.find().populate('parent');
  return NextResponse.json(categories);
}

export async function PUT(request) {
  await mongooseConnect();
  const { _id, name, parentCategory } = await request.json();
  const categoryDoc = await Category.updateOne(
    { _id },
    { 
      name,
      parent: parentCategory || undefined,
    }
  );
  return NextResponse.json(categoryDoc);
}

export async function DELETE(request) {
  await mongooseConnect();
  const _id = request.nextUrl.searchParams.get('_id');
  await Category.deleteOne({ _id });
  return NextResponse.json(true);
}