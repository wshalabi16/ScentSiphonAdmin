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
  const status = req.nextUrl.searchParams.get('status') || 'all';

  const page = Math.max(1, Math.min(1000, rawPage));  // Max page 1,000
  const limit = Math.max(1, Math.min(50, rawLimit));   // Max 50 items per page
  const skip = (page - 1) * limit;

  // ✅ CLEAN & SIMPLE: Build filter based on status
  // This works because all orders now have shipped/delivered fields from schema defaults
  let filter = {};
  switch(status) {
    case 'pending':
      filter = { paid: false };
      break;
    case 'paid':
      // Ready to ship: paid but not shipped
      filter = { paid: true, shipped: { $ne: true } };
      break;
    case 'shipped':
      // Shipped but not delivered
      filter = { paid: true, shipped: true, delivered: { $ne: true } };
      break;
    case 'delivered':
      filter = { delivered: true };
      break;
    case 'all':
    default:
      filter = {};
  }

  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).limit(limit).skip(skip),
    Order.countDocuments(filter)
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

export const PATCH = apiErrorHandler(async (req) => {
  await mongooseConnect();

  if (!await isAdminRequest()) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const { orderId, action, trackingNumber } = await req.json();

  if (!orderId || !action) {
    return NextResponse.json({ error: 'Missing orderId or action' }, { status: 400 });
  }

  const order = await Order.findById(orderId);
  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  let updateData = {};

  switch(action) {
    case 'mark_shipped':
      if (!order.paid) {
        return NextResponse.json({ error: 'Cannot ship unpaid order' }, { status: 400 });
      }
      updateData = {
        shipped: true,
        shippedAt: new Date(),
        ...(trackingNumber && { trackingNumber })
      };
      break;

    case 'mark_delivered':
      if (!order.shipped) {
        return NextResponse.json({ error: 'Cannot mark as delivered before shipping' }, { status: 400 });
      }
      updateData = {
        delivered: true,
        deliveredAt: new Date()
      };
      break;

    case 'unmark_shipped':
      updateData = {
        shipped: false,
        shippedAt: null,
        delivered: false,
        deliveredAt: null,
        trackingNumber: null
      };
      break;

    case 'unmark_delivered':
      updateData = {
        delivered: false,
        deliveredAt: null
      };
      break;

    default:
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  const updatedOrder = await Order.findByIdAndUpdate(
    orderId,
    updateData,
    { new: true }
  );

  return NextResponse.json(updatedOrder);
}, 'ORDER_UPDATE');