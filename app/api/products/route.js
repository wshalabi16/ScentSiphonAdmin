import { Product } from "@/models/Product";
import { Category } from "@/models/Category";
import { mongooseConnect } from "@/lib/mongoose";
import { NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/isAdmin';
import { apiErrorHandler } from '@/lib/apiErrorHandler';
import mongoose from 'mongoose';

export const POST = apiErrorHandler(async (request) => {
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
}, 'PRODUCT_CREATE');

export const GET = apiErrorHandler(async (request) => {
  await mongooseConnect();

  if (!await isAdminRequest()) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const id = request.nextUrl.searchParams.get('id');

  // Single product fetch
  if (id) {
    return NextResponse.json(await Product.findOne({ _id: id }).populate('category'));
  }

  // Pagination for product list
  const page = parseInt(request.nextUrl.searchParams.get('page') || '1');
  const limit = parseInt(request.nextUrl.searchParams.get('limit') || '50');
  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    Product.find()
      .populate('category')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip),
    Product.countDocuments()
  ]);

  return NextResponse.json({
    products,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
}, 'PRODUCT_READ');

export const PUT = apiErrorHandler(async (request) => {
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
}, 'PRODUCT_UPDATE');

export const DELETE = apiErrorHandler(async (request) => {
  await mongooseConnect();

  if (!await isAdminRequest()) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const id = request.nextUrl.searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'No ID provided' }, { status: 400 });
  }

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  const result = await Product.deleteOne({ _id: id });

  if (result.deletedCount === 0) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}, 'PRODUCT_DELETE');