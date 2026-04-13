"use client";
import { UserData } from "@/lib/types";
import React, { createContext, useContext, useState, ReactNode } from "react";

const emptyData: UserData = {
  id: undefined,
  email: undefined,
  nickname: undefined,
  learningLanguage: null,
  learningLanguage2: null,
  learningLanguage3: null,
  masterLanguage: null,
  masterLanguage2: null,
  masterLanguage3: null,
  countLetters: undefined,
  countCorrectedLetter: undefined,
  country: undefined,
  bio: undefined,
  image: null,
  location: {
    city: undefined,
    country: undefined,
  },
  created_at: null,
};

type UserContextType = {
  userData: UserData;
  setUserData: React.Dispatch<React.SetStateAction<UserData>>;
  clear: React.Dispatch<void>;
};

export const UserContext = createContext<UserContextType>({
  userData: emptyData,
  setUserData: () => undefined,
  clear: () => undefined,
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [userData, setUserData] = useState<UserData>(emptyData);
  const clear = () => {
    setUserData(emptyData);
  };

  return (
    <UserContext.Provider value={{ userData, setUserData, clear }}>
      {children}
    </UserContext.Provider>
  );
}
