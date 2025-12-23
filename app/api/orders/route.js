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

  const orders = await Order.find().sort({ createdAt: -1 });
  return NextResponse.json(orders);
}, 'ORDER_READ');