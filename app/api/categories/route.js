import { Category } from "@/models/Category";
import { mongooseConnect } from "@/lib/mongoose";
import { NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/isAdmin';

export async function POST(request) {
  await mongooseConnect();
  
  if (!await isAdminRequest()) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }
  
  const { name, parentCategory } = await request.json();
  const categoryDoc = await Category.create({
    name,
    parent: parentCategory || undefined,
  });
  return NextResponse.json(categoryDoc);
}

export async function GET() {
  await mongooseConnect();
  
  if (!await isAdminRequest()) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }
  
  const categories = await Category.find().populate('parent');
  return NextResponse.json(categories);
}

export async function PUT(request) {
  await mongooseConnect();
  
  if (!await isAdminRequest()) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }
  
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
  
  if (!await isAdminRequest()) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }
  
  const _id = request.nextUrl.searchParams.get('_id');
  await Category.deleteOne({ _id });
  return NextResponse.json(true);
}