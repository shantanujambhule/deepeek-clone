"use client";

import { useUser } from "@clerk/nextjs";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import toast from "react-hot-toast";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";

export const AppContext = createContext();

export const useAppContext = () => {
  return useContext(AppContext);
};

export const AppContextProvider = ({ children }) => {
  const { user } = useUser();
  const { getToken } = useAuth();

  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);

  const createNewChat = async () => {
    try {
      if (!user) return null;

      const token = await getToken();

      await axios.post(
        "/api/chat/create",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchUserChats();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const fetchUserChats = async () => {
    try {
      const token = await getToken();

      const res = await axios.get("/api/chat/get", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = res.data;

      if (data.success) {
        let chatList = data.data;

        if (chatList.length === 0) {
          await createNewChat();
          return fetchUserChats(); // Refetch after chat creation
        } else {
          chatList.sort(
            (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
          );
          setChats(chatList);
          setSelectedChat(chatList[0]);
          console.log(chatList[0]);
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserChats();
    }
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      chats,
      selectedChat,
      setSelectedChat,
      createNewChat,
      fetchUserChats,
    }),
    [user, chats, selectedChat]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
