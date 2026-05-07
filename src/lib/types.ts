import { CalendarDate } from "@internationalized/date";

export interface User {
  id: string;
  nickname: string;
  image: string;
  createdAt?: string;
}
export interface CorrectedLetter {
  id: string;
  title: string;
  author: User;
  content: string;
  date: CalendarDate;
  corrections: Correction[];
  comments: string;
  sentBack: boolean;
  deleted: boolean;
  sender: User;
  reviewer: User;
  createdAt?: string;
}

export interface Correction {
  textOriginal: string;
  textCorrected: string;
  startIndex: number;
  endIndex: number;
}

export interface MyLetters {
  id: string;
  title: string;
  language: string;
  created_at: string;
}

export interface ReceivedLetterListProps {
  letters: {
    id: string;
    originalLetter: {
      id: string;
      author: string;
      title: string;
      language: string;
      created_at: string;
    };
    sender: {
      nickname: string;
      avatar: string;
    };
    sentBack: boolean;
    corrected_at: string;
    seen: boolean;
  }[];
}

export interface Letter {
  id: string;
  created_at: string;
  diary: string | null;
  title: string;
  language: string;
  sharedWith: {
    nickname: string;
    image: string;
    correctionSentBack: boolean;
    correctedLetterId: string;
  }[];
  selectedToDelete?: boolean;
}

export interface ReceivedLetter {
  id: string;
  originalLetter: {
    id: string;
    author: string;
    title: string;
    language: string;
    created_at: string;
    deleted: boolean;
  };
  sender: User;
  sentBack: boolean;
  corrected_at: string;
  received_at: string;
  seen: boolean;
}

export interface LetterFormErrors {
  title: boolean;
  date: boolean;
  language: boolean;
  content: boolean;
}

export interface NewLetter {
  id: string;
  date: CalendarDate;
  diary: string;
  language: string;
  title: string;
  letterContent: string;
  sharedWith: SharedWithUser[];
}
export interface SharedWithUser {
  id: string;
  nickname: string;
  image: string;
}

export interface UserData {
  id?: string;
  email?: string;
  nickname?: string;
  password?: string;
  learningLanguage?: string | null;
  learningLanguage2?: string | null;
  learningLanguage3?: string | null;
  masterLanguage?: string | null;
  masterLanguage2?: string | null;
  masterLanguage3?: string | null;
  countLetters?: Record<string, number>;
  countCorrectedLetter?: Record<string, number>;
  country?: string;
  bio?: string;
  image?: string | null;
  location?: {
    city?: string;
    country?: string;
  };
  created_at?: Date | null;
  isFriend?: boolean;
}

export interface ApiResponse<T = unknown> {
  ok: boolean;
  data?: T;
  errorMessage?: string;
}

export interface Credentials {
  email: string;
  password: string;
}

export interface LoginData {
  token: string;
  userData: UserData;
}

export interface RegisterData {
  message: string;
  userId?: string;
}

export enum ValidationCodePurpose {
  PASSWORD_RESET = "password_reset",
  REGISTER = "register",
}
