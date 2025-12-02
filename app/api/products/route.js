import { Product } from "@/models/Product";
import { Category } from "@/models/Category";
import { mongooseConnect } from "@/lib/mongoose";
import { NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/isAdmin';

export async function POST(request) {
  await mongooseConnect();
  
  if (!await isAdminRequest()) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }
  
  const { title, description, price, images, category, variants, featured } = await request.json(); 
  const productDoc = await Product.create({
    title,
    description,
    price,
    images,
    category: category || undefined,
    variants: variants || [],
    featured: featured || false, 
  });
  return NextResponse.json(productDoc);
}

export async function GET(request) {
  await mongooseConnect();
  
  if (!await isAdminRequest()) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }
  
  const id = request.nextUrl.searchParams.get('id');
  if (id) {
    return NextResponse.json(await Product.findOne({ _id: id }).populate('category'));
  } else {
    return NextResponse.json(await Product.find().populate('category'));
  }
}

export async function PUT(request) {
  await mongooseConnect();
  
  if (!await isAdminRequest()) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }
  
  const { title, description, price, images, category, variants, featured, _id } = await request.json(); 
  await Product.updateOne(
    { _id }, 
    { 
      title, 
      description, 
      price, 
      images,
      category: category || undefined,
      variants: variants || [],
      featured: featured || false, 
    }
  );
  return NextResponse.json(true);
}

export async function DELETE(request) {
  await mongooseConnect();
  
  if (!await isAdminRequest()) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }
  
  const id = request.nextUrl.searchParams.get('id');
  if (id) {
    await Product.deleteOne({ _id: id });
    return NextResponse.json(true);
  }
  return NextResponse.json({ error: 'No ID provided' }, { status: 400 });
}