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
      <Label className="text-black">Select diary</Label>
      <Select
        value={diarySelected}
        onValueChange={(diary) => {
          onDiaryChanged(diary);
        }}
      >
        <SelectTrigger className="text-black bg-white h-10 rounded-md ring-transparent">
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
            className="cursor-pointer flex justify-center items-center hover:bg-gray-100 w-full text-sm bg-white h-8 rounded-md ring-transparent text-[#8EBA03]"
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
