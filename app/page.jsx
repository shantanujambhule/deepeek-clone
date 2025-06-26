"use client"
import { assets } from "@/assets/assets"
import Message from "@/components/Message"
import PromptBox from "@/components/PromptBox"
import Sidebar from "@/components/Sidebar"
import { useAppContext } from "@/context/AppContext"
import Image from "next/image"
import React, { useEffect, useRef, useState } from "react"

export default function Home() {
  const [expand, setExpand] = useState(false)
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const {selectedChat} = useAppContext();
  const containerRef = useRef(null)

  useEffect(() => {
    if(selectedChat){
      setMessages(selectedChat.messages)
    }
  }, [selectedChat])

  useEffect(() => {
    if(containerRef.current){
      containerRef.current.scrollTo({top: containerRef.current.scrollHeight,
        behaviour: 'smooth',
      })
    }
  }, [messages])


  return (
    <div>
      <div className="flex h-screen">
        <Sidebar expand={expand} setExpand={setExpand} messages={messages} setMessages={setMessages} isLoading={isLoading} setIsLoading={setIsLoading}/>
        <div/>
        <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8 bg-[#292a2d] text-white relative">
          <div className="md:hidden absolute px-4 top-6 flex items-center justify-between w-full">
            <Image onClick={() => (expand ? setExpand(false) : setExpand(true))} className="rotate-180" src={assets.menu_icon} alt="menu icon"/>
            <Image className="opacity-70" src={assets.chat_icon} alt="chat icon"/>
          </div>
          {
            messages.length === 0 ? (
              <>
              <div className="flex items-center gap-3">
              <Image src={assets.logo_icon} alt="logo icon" className="h-16"/>  
              <p className="text-2xl font-medium">Hi, I'm DeepSeek</p>
              </div>
              <p className="text-sm mt-2">How can I help you today?</p>
              </>
            ):
            (<div ref={containerRef} 
            className="relative flex flex-col items-center justify-start w-full mt-20 max-h-screen overflow-y-auto" >
              <p className="fixed top-8 border border-transparent hover:border-gray-500/50 py-1 px-2 rounded-lg font-semibold mb-6">
              {selectedChat.name}</p>
              {messages.map((msg, index) => (
              <Message role={msg.role} key={index} content={msg.content}/>
              ))}
              {
                isLoading && (
                  <div className="flex gap-4 max-w-3xl w-full py-3">
                    <Image src={assets.logo_icon} alt="logo icon" className="h-9 w-9 p-1 border-white/15 rounded-full" />
                  <div className="flex items-center justify-center gap-1 loader">
                  <div className="w-1 h-1 rounded-full bg-white animate-bounce"></div>
                  <div className="w-1 h-1 rounded-full bg-white animate-bounce"></div>
                  <div className="w-1 h-1 rounded-full bg-white animate-bounce"></div>
                  </div>
                  </div>
                )

              }
            </div>)
          }
          <PromptBox isLoading={isLoading} setIsLoading={setIsLoading}/>
          <p className="absolute text-sm bottom-1 text-gray-500">Ai-Generated, for reference only</p>
        </div>
      </div>
    </div>
  );
}
