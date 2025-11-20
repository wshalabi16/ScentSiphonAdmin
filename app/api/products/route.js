import { Product } from "@/models/Product";
import { mongooseConnect } from "@/lib/mongoose";
import { NextResponse } from 'next/server';

export async function POST(request) {
  await mongooseConnect();
  const { title, description, price, images } = await request.json();
  const productDoc = await Product.create({
    title,
    description,
    price,
    images,
  });
  return NextResponse.json(productDoc);
}

export async function GET(request) {
  await mongooseConnect();
  const id = request.nextUrl.searchParams.get('id');
  if (id) {
    return NextResponse.json(await Product.findOne({ _id: id }));
  } else {
    const products = await Product.find();
    return NextResponse.json(products);
  }
}

export async function PUT(request) {
  await mongooseConnect();
  const { title, description, price, images, _id } = await request.json();
  await Product.updateOne({ _id }, { title, description, price, images });
  return NextResponse.json(true);
}

export async function DELETE(request) {
  await mongooseConnect();
  const id = request.nextUrl.searchParams.get('id');
  if (id) {
    await Product.deleteOne({ _id: id });
    return NextResponse.json(true);
  }
  return NextResponse.json({ error: 'No ID provided' }, { status: 400 });
}