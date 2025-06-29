// app/api/webhook/route.js or wherever your route is
import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import User from "@/models/User";

export async function POST(req) {
  const wh = new Webhook(process.env.SIGNING_SECRET);
  const headerPayload = headers();
  const svixHeaders = {
    "svix-id": headerPayload.get("svix-id"),
    "svix-timestamp": headerPayload.get("svix-timestamp"),
    "svix-signature": headerPayload.get("svix-signature"),
  };

  // 2. Read and stringify body correctly
  const payload = await req.json();
  const body = JSON.stringify(payload);
 const { data, type } = wh.verify(body, svixHeaders)

  const userData = {
    _id: data.id, 
    name: `${data.first_name} ${data.last_name}`,
    email: data.email_addresses[0].email_address,
    image: data.image_url,
  };

  await connectDB();

    switch (type) {
      case "user.created":
        await User.create(userData);
        break;
      case "user.updated":
        await User.findByIdAndUpdate(data.id, userData);
        break;
      case "user.deleted":
        await User.findByIdAndDelete(data.id);
        break;
      default:  
        break;
    }
  return NextResponse.json({ message: "✅ Event received" });
}
