// app/api/webhook/route.js or wherever your route is
import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

import connectDB from "@/config/db";
import User from "@/models/User";

export async function POST(req) {
  // 1. Get headers from request
  const headerPayload = headers();
  const svixHeaders = {
    "svix-id": headerPayload.get("svix-id"),
    "svix-timestamp": headerPayload.get("svix-timestamp"),
    "svix-signature": headerPayload.get("svix-signature"),
  };

  // 2. Read and stringify body correctly
  const payload = await req.json();
  const body = JSON.stringify(payload); // FIXED: typo was "stringfy"

  // 3. Verify webhook
  const wh = new Webhook(process.env.SIGNING_SECRET);
  let evt;
  try {
    evt = wh.verify(body, svixHeaders); // returns { id, type, data }
  } catch (err) {
    console.error("❌ Webhook verification failed:", err);
    return new NextResponse("Invalid signature", { status: 400 });
  }

  const { data, type } = evt;

  const userData = {
    _id: data.id, // Clerk's `id` as MongoDB `_id` (only if you're sure)
    name: `${data.first_name} ${data.last_name}`,
    email: data.email_addresses?.[0]?.email_address,
    image: data.image_url || "",
  };

  await connectDB();

  try {
    switch (type) {
      case "user.created":
        await User.create(userData);
        break;
      case "user.updated":
        await User.findByIdAndUpdate(data.id, userData, { new: true, upsert: true });
        break;
      case "user.deleted":
        await User.findByIdAndDelete(data.id);
        break;
      default:
        console.log("Unhandled event type:", type);
        break;
    }
  } catch (err) {
    console.error("❌ MongoDB operation error:", err);
    return new NextResponse("Server error", { status: 500 });
  }

  return NextResponse.json({ message: "✅ Event received" });
}
