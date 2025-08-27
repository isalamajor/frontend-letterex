"use client";

import { Input1 } from "@/components/ui/input1";
import { Label } from "@/components/ui/field";
import { Eye, EyeOff } from "lucide-react";
import { useId, useState, useEffect } from "react";

interface InputPassProps {
  onChange: (password: string) => void;
  wrongPassword: boolean;
}


function InputPass({ onChange, wrongPassword }: InputPassProps) {
  const id = useId();
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [markRed, setMarkRed] = useState<boolean>(false);

  useEffect(() => { 
    setMarkRed(wrongPassword);
  }, [wrongPassword]);

  const toggleVisibility = () => setIsVisible((prevState) => !prevState);

  return (
    <div className="space-y-2 min-w-[300px] text-black">
      <Label htmlFor={id}>Enter password</Label>
      <div className="relative">
        <Input1
          id={id}
          className={`w-full p-2 border rounded text-black/80 bg-white ${markRed ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-gray-300"}`}
          placeholder="Password"
          type={isVisible ? "text" : "password"}
          onChange={(e) => {setMarkRed(false);
            onChange(e.target.value);
          }}
        />
        <button
            className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg text-black/80 outline-offset-2 transition-colors hover:text-black focus:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
          type="button"
          onClick={toggleVisibility}
          aria-label={isVisible ? "Hide password" : "Show password"}
          aria-pressed={isVisible}
          aria-controls="password"
        >
          {isVisible ? (
            <EyeOff size={16} strokeWidth={2} aria-hidden="true" />
          ) : (
            <Eye size={16} strokeWidth={2} aria-hidden="true" />
          )}
        </button>
      </div>
      {markRed && (
        <p className="text-xs text-red-500">Incorrect password. Please try again.</p>
      )}
    </div>
  );
}

export { InputPass };
