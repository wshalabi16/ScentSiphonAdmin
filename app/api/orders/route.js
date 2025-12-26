import { mongooseConnect } from "@/lib/mongoose";
import { Order } from "@/models/Order";
import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/isAdmin";
import { apiErrorHandler } from "@/lib/apiErrorHandler";

export const GET = apiErrorHandler(async (req) => {
  await mongooseConnect();

  if (!await isAdminRequest()) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  // Add pagination with validation
  const rawPage = parseInt(req.nextUrl.searchParams.get('page') || '1');
  const rawLimit = parseInt(req.nextUrl.searchParams.get('limit') || '20');

  const page = Math.max(1, Math.min(1000, rawPage));  // Max page 1,000
  const limit = Math.max(1, Math.min(50, rawLimit));   // Max 50 items per page
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find().sort({ createdAt: -1 }).limit(limit).skip(skip),
    Order.countDocuments()
  ]);

  return NextResponse.json({
    orders,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
}, 'ORDER_READ');