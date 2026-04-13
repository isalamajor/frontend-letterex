import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/field";
import { useDialog } from "@/context/dialogContext";
import { BookOpen } from "lucide-react";

interface DiarySelectProps {
  diaryList: string[];
  diarySelected: string;
  onNewDiaryCreated: (diaryName: string) => void;
  onDiaryChanged: (diarySelected: string) => void;
}

export const DiarySelect = ({
  diaryList,
  diarySelected,
  onNewDiaryCreated,
  onDiaryChanged,
}: DiarySelectProps) => {
  const { openDialog } = useDialog();
  return (
    <div>
      <Label className="text-black dark:text-gray-200">Select diary</Label>
      <Select
        value={diarySelected}
        onValueChange={(diary) => {
          onDiaryChanged(diary);
        }}
      >
        <SelectTrigger className="text-black dark:text-gray-100 bg-white dark:bg-neutral-900 h-10 rounded-md ring-transparent border border-neutral-300 dark:border-neutral-700">
          <SelectValue placeholder="(None)" />
        </SelectTrigger>
        <SelectContent>
          {diaryList.map((diary) => (
            <SelectItem key={diary} value={diary}>
              {diary}
            </SelectItem>
          ))}
          <div
            key="new"
            className="cursor-pointer flex justify-center items-center hover:bg-gray-100 dark:hover:bg-neutral-800 w-full text-sm bg-white dark:bg-neutral-900 h-8 rounded-md ring-transparent text-[#60a5fa]"
            onClick={(e) => {
              e.preventDefault();
              openDialog({
                title: "Create New Diary",
                description: "Enter a name for your new diary.",
                primaryActionText: "OK",
                type: "newDiary",
                autoDismiss: false,
                onNewDiaryCreated: onNewDiaryCreated,
              });
            }}
          >
            <BookOpen className="mr-2" size={15} /> Create new diary
          </div>
        </SelectContent>
      </Select>
    </div>
  );
};
