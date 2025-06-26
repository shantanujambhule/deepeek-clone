
import React, { useState } from 'react'
import Image from 'next/image'
import { assets } from '@/assets/assets'
import { useAppContext } from '@/context/AppContext';
import { set } from 'mongoose';
import axios from 'axios';


const PromptBox = ({setIsLoading,isLoading}) => {
    const [prompt, setPrompt] = useState("");
    const {user,chats,setChats, selectedChat, setSelectedChat} = useAppContext();

    const handelKeyDown = (e) => {
      if(e.key === 'Enter' && !e.shiftKey){
        e.preventDefault();
        sendPrompt(e);
      }
    }
    const sendPrompt = async () => {
        const promptCopy = prompt;
        try{
          e.preventDefault();
          if(!user) return toast.error('User Not Authenticated');
          if(isLoading) return toast.error('wait for previous prompt')

            setIsLoading(true);
            setPrompt('');
            
            const userPrompt = {
                role: 'user',
                content: prompt,
                timestamp: Date.now(),
            }
            setChats((prevChats) => prevChats.map((chat) => 
                chat._id === selectedChat._id ? {...chat, messages: [...chat.messages, userPrompt]} :
                    chat
          
))
setSelectedChat((prev) =>({ prev, messages: [...prev.messages, userPrompt]}))
            const {data} = await axios.post('/api/chat/ai', {
                chatId: selectedChat._id,
                prompt
        })
              if(data.success){
                setChats((prevChats) => prevChats.map((chat) => chat._id === selectedChat._id ? {...chat, messages: [...chat.messages, data.data]} : chat))
                
                const message = data.data.content;
                const messageTokens = message.split(' ').length;
                let assistantMessage = {
                    role: 'assistant',
                    content: "",
                    timestamp: Date.now(),
                   
                }
                setSelectedChat((prev) => ({
                    ...prev,
                    messages: [...prev.messages, assistantMessage]
                }))
                
                for(let i = 0; i < messageTokens.length; i++){
                    setTimeout(() => {
                        assistantMessage.content = messageTokens.slice(0, i).join(' ');
                        setSelectedChat((prev) => {
                          const updateMessages = [
                            ...prev.messages.slice(0, -1),
                            assistantMessage,
                          ]
                            return {
                                ...prev,
                                messages: updateMessages,
                            }
                        })
                      },i * 100)
                      }             
        }else{
            toast.error(data.message);
            setPrompt(promptCopy);
        }
        }
        catch(error){
            toast.error(error.message)
        }
        finally{
            setIsLoading(false);
        }
      }
  return (
    <form onSubmit={sendPrompt}
     className={`w-full ${false ? "max-w-3xl" : "max-w-2xl"} bg-[#404045] p-4 rounded-3xl mt-4 transition-all`}>
      <textarea onKeyDown={handelKeyDown}
      className='outline-none w-full resize-none overflow-hidden break-words bg-transparent'
      rows={2}
      placeholder = "Message DeepSeek" required 
      value={prompt}
      onChange={(e) => setPrompt(e.target.value)}
      />
      <div className='flex items-center justify-between text-sm'>
        <div className='flex items-center gap-2'>
            <p className='flex items-center gap-2 text-xs border border-gray-300/40 px-2 py-1 rounded-full cursor-pointer hover:bg-gray-500/20 transition'>
                <Image className='h-5'src={assets.deepthink_icon} alt='deepthink icon'/>
                DeepThink (R1)
            </p>
            <p className='flex items-center gap-2 text-xs border border-gray-300/40 px-2 py-1 rounded-full cursor-pointer hover:bg-gray-500/20 transition'>
                <Image className='h-5'src={assets.search_icon} alt='deepthink icon'/>
                Search
            </p>
        </div>
        <div className='flex items-center gap-2'>
            <Image src={assets.pin_icon}  className='w-4 cursor-pointer' alt='pin icon'/>
            <button className={`${prompt ? "bg-primary" : "bg-gray-300"} rounded-full p-2 cursor-pointer`}>
                <Image src={prompt ? assets.arrow_icon : assets.arrow_icon_dull} className='w-3.5 aspect-square' alt='arrow icon'/>
            </button>
        </div>
      </div>
    
    </form>
  )
}

export default PromptBox
