import { CalendarDate } from "@internationalized/date";

export interface UserInvolved {
  id: string;
  nickname: string;
  image: string;
}

export interface CorrectedLetter {
  title: string;
  author: UserInvolved;
  content: string;
  date: CalendarDate;
  corrections: Correction[];
  comments: string;
  sentBack: boolean;
  deleted?: boolean;
  sender: UserInvolved;
  reviewer: UserInvolved;
}

export interface Correction {
  textOriginal: string;
  textCorrected: string;
  startIndex: number;
  endIndex: number;
}
