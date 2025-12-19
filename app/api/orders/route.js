import { mongooseConnect } from "@/lib/mongoose";
import { Order } from "@/models/Order";
import { NextResponse } from "next/server";

export async function GET(req) {
  await mongooseConnect();
  
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Orders fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}