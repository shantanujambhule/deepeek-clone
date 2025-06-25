import { Webhook } from "svix";
import connectDB from "@/config/db";
import User from "@/models/User";
import { NextRequest } from "next/server";

export async function POST(req) {
    const wh = new Webhook(process.env.SIGNING_SECRET);
    const headerPayload = await headers()
    const svixHeaders = {
        "svix-id": headerPayload.get("svix-id"),
        "svix-signature": headerPayload.get("svix-signature"),
    
    };
    const payload = await req.json();
    const body = JSON.stringfy(payload);
    const {data,type} = wh.verify(body, svixHeaders)

    const userData = {
        _id:data.id,
        name:`${data.first_name} ${data.last_name}`,
        email:data.email_addresses[0].email_address,
        image:data.image_url,
    
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
    return NextRequest.json({ message:"Event Recieved"});

}