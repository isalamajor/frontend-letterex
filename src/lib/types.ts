import { CalendarDate } from "@internationalized/date";

export interface User {
  id: string;
  nickname: string;
  image: string;
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
[];

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
