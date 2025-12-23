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

  const { name, parentCategory } = await request.json();

  // Validate parent category exists if provided
  if (parentCategory) {
    if (!mongoose.Types.ObjectId.isValid(parentCategory)) {
      return NextResponse.json({ error: 'Invalid parent category ID' }, { status: 400 });
    }

    const parentExists = await Category.findById(parentCategory);
    if (!parentExists) {
      return NextResponse.json({ error: 'Parent category not found' }, { status: 404 });
    }
  }

  const categoryDoc = await Category.create({
    name,
    parent: parentCategory || undefined,
  });
  return NextResponse.json(categoryDoc);
}, 'CATEGORY_CREATE');

export const GET = apiErrorHandler(async () => {
  await mongooseConnect();

  if (!await isAdminRequest()) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const categories = await Category.find().populate('parent');
  return NextResponse.json(categories);
}, 'CATEGORY_READ');

export const PUT = apiErrorHandler(async (request) => {
  await mongooseConnect();

  if (!await isAdminRequest()) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const { _id, name, parentCategory } = await request.json();

  // Validate parent category if provided
  if (parentCategory) {
    if (!mongoose.Types.ObjectId.isValid(parentCategory)) {
      return NextResponse.json({ error: 'Invalid parent category ID' }, { status: 400 });
    }

    const parentExists = await Category.findById(parentCategory);
    if (!parentExists) {
      return NextResponse.json({ error: 'Parent category not found' }, { status: 404 });
    }

    // Prevent self-reference
    if (parentCategory === _id) {
      return NextResponse.json({ error: 'Category cannot be its own parent' }, { status: 400 });
    }

    // Check for circular reference (A -> B, B -> C, trying to set C -> A)
    let current = parentCategory;
    const visited = new Set([_id]);

    while (current) {
      if (visited.has(current.toString())) {
        return NextResponse.json({
          error: 'Circular reference detected in category hierarchy'
        }, { status: 400 });
      }

      visited.add(current.toString());
      const cat = await Category.findById(current);
      current = cat?.parent;
    }
  }

  const categoryDoc = await Category.updateOne(
    { _id },
    {
      name,
      parent: parentCategory || undefined,
    }
  );
  return NextResponse.json(categoryDoc);
}, 'CATEGORY_UPDATE');

export const DELETE = apiErrorHandler(async (request) => {
  await mongooseConnect();

  if (!await isAdminRequest()) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const _id = request.nextUrl.searchParams.get('_id');

  // Validate ObjectId
  if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  const result = await Category.deleteOne({ _id });

  if (result.deletedCount === 0) {
    return NextResponse.json({ error: 'Category not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}, 'CATEGORY_DELETE');