export const maxDuration = 60;

import connectDB from "@/config/db";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import Chat from "@/models/Chat";
import {getAuth} from '@clerk/nextjs/server'


const openai = new OpenAI({
        baseURL: 'https://api.deepseek.com',
        apiKey: process.env.DEEPSEEK_API_KEY,
});

export async function POST(req) {
try {
    const {userId} = getAuth(req) 

    const {chatId, prompt} = await req.json();

    if(!userId){
        return NextResponse.json({success:false, message:"User Not Authenticated",})
    }
    await connectDB();
    const data = await Chat.findOne({userId, _id:chatId})
    const userPrompt = {
        role: 'user',
        content: prompt,
        timestamp: Date.now(),
    }

    data.messages.push(userPrompt);
    await data.save();

    const response = await openai.chat.completions.create({
        messages:[{role: 'user', content: prompt}],
        model: 'gpt-3.5-turbo',
        store:true,
    
    });

    const message = completion.choices[0].message;
    message.timestamp = Date.now();
    data.messages.push(message);
    data.save();

    return NextResponse.json({success:true, data:message})

    
} catch (error) {
    return NextResponse.json({success:false, error: error.message})
}
}


