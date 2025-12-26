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

  // Validate variants
  if (variants) {
    // Must be an array
    if (!Array.isArray(variants)) {
      return NextResponse.json({ error: 'Variants must be an array' }, { status: 400 });
    }

    // Check each variant
    const seenSizes = new Set();
    for (const variant of variants) {
      // Size must not be empty
      if (!variant.size || variant.size.trim() === '') {
        return NextResponse.json({ error: 'All variants must have a size' }, { status: 400 });
      }

      // Check for duplicate sizes
      const normalizedSize = variant.size.trim().toLowerCase();
      if (seenSizes.has(normalizedSize)) {
        return NextResponse.json({ error: `Duplicate variant size: ${variant.size}` }, { status: 400 });
      }
      seenSizes.add(normalizedSize);

      // Price must be positive
      const variantPrice = parseFloat(variant.price);
      if (isNaN(variantPrice) || variantPrice <= 0) {
        return NextResponse.json({ error: `Variant "${variant.size}" must have a positive price` }, { status: 400 });
      }

      // Stock must be non-negative
      const variantStock = parseInt(variant.stock);
      if (isNaN(variantStock) || variantStock < 0) {
        return NextResponse.json({ error: `Variant "${variant.size}" must have non-negative stock` }, { status: 400 });
      }
    }
  }

  // Enforce featured products limit
  if (featured) {
    const MAX_FEATURED = 10;
    const featuredCount = await Product.countDocuments({ featured: true });

    if (featuredCount >= MAX_FEATURED) {
      return NextResponse.json({
        error: `Maximum ${MAX_FEATURED} featured products allowed. Please un-feature another product first.`
      }, { status: 400 });
    }
  }

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

  // Pagination for product list with validation
  const rawPage = parseInt(request.nextUrl.searchParams.get('page') || '1');
  const rawLimit = parseInt(request.nextUrl.searchParams.get('limit') || '50');

  // Enforce safe bounds to prevent DoS attacks
  const page = Math.max(1, Math.min(10000, rawPage));  // Max page 10,000
  const limit = Math.max(1, Math.min(100, rawLimit));   // Max 100 items per page
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

  // Validate variants
  if (variants) {
    // Must be an array
    if (!Array.isArray(variants)) {
      return NextResponse.json({ error: 'Variants must be an array' }, { status: 400 });
    }

    // Check each variant
    const seenSizes = new Set();
    for (const variant of variants) {
      // Size must not be empty
      if (!variant.size || variant.size.trim() === '') {
        return NextResponse.json({ error: 'All variants must have a size' }, { status: 400 });
      }

      // Check for duplicate sizes
      const normalizedSize = variant.size.trim().toLowerCase();
      if (seenSizes.has(normalizedSize)) {
        return NextResponse.json({ error: `Duplicate variant size: ${variant.size}` }, { status: 400 });
      }
      seenSizes.add(normalizedSize);

      // Price must be positive
      const variantPrice = parseFloat(variant.price);
      if (isNaN(variantPrice) || variantPrice <= 0) {
        return NextResponse.json({ error: `Variant "${variant.size}" must have a positive price` }, { status: 400 });
      }

      // Stock must be non-negative
      const variantStock = parseInt(variant.stock);
      if (isNaN(variantStock) || variantStock < 0) {
        return NextResponse.json({ error: `Variant "${variant.size}" must have non-negative stock` }, { status: 400 });
      }
    }
  }

  // Enforce featured products limit when toggling featured on
  if (featured) {
    const MAX_FEATURED = 10;
    const existingProduct = await Product.findById(_id);

    // Only check if we're changing from non-featured to featured
    if (!existingProduct?.featured) {
      const featuredCount = await Product.countDocuments({ featured: true });

      if (featuredCount >= MAX_FEATURED) {
        return NextResponse.json({
          error: `Maximum ${MAX_FEATURED} featured products allowed. Please un-feature another product first.`
        }, { status: 400 });
      }
    }
  }

  const result = await Product.updateOne(
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

  // Check if update actually happened
  if (result.matchedCount === 0) {
    return NextResponse.json({
      error: 'Product not found or was deleted'
    }, { status: 404 });
  }

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