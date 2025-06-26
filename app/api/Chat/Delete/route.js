import Chat from "@/models/Chat";
import { auth } from "@clerk/nextjs/server"; // ✅ FIXED
import { NextResponse } from "next/server";
import connectDB from "@/config/db";


export async function POST(req) {
  try {
    const { userId } = auth(); // ✅ Use this in App Router

    if (!userId) {
      return NextResponse.json({
        success: false,
        message: "user not authenticated",
      });
    }

    const { chatId } = await req.json();

    await connectDB();
    await Chat.deleteOne({ _id: chatId, userId });

    return NextResponse.json({
      success: true,
      message: "Chat deleted",
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
    });
  }
}
