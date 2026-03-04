"use client";

import { Input1 } from "@/components/ui/input1";
import { Eye, EyeOff } from "lucide-react";
import { useId, useState, useEffect } from "react";
import { Label } from "@/components/ui/field";

interface InputPassProps {
  onSave: (
    password: string,
    NewPassword: string,
    ConfirmPassword: string,
  ) => void;
}

function InputPasswords({ onSave }: InputPassProps) {
  const id = useId();
  const [isVisibleCurrent, setIsVisibleCurrent] = useState<boolean>(true);
  const [isVisibleNew, setIsVisibleNew] = useState<boolean>(true);
  const [isVisibleConfirm, setIsVisibleConfirm] = useState<boolean>(true);
  const [password, setPassword] = useState<string>("");
  const [NewPassword, setNewPassword] = useState<string>("");
  const [ConfirmPassword, setConfirmPassword] = useState<string>("");
  const forbiddenCharsRegex = /[\s'"\\<>]/g;

  // Error message for new password
  const isNewPasswordTooShort =
    NewPassword.length > 0 && NewPassword.length < 8;
  const isNewPasswordSameAsCurrent =
    NewPassword.length >= 8 && NewPassword === password;
  // Error message for confirmation
  const isConfirmPasswordTooShort =
    ConfirmPassword.length > 0 && ConfirmPassword.length < 8;
  const isConfirmPasswordMismatch =
    ConfirmPassword.length >= 8 && ConfirmPassword !== NewPassword;

  useEffect(() => {
    // Only calls onSave if all passwords are valid and new password is different from current
    if (
      password &&
      NewPassword &&
      ConfirmPassword &&
      NewPassword === ConfirmPassword &&
      NewPassword.length >= 8 &&
      NewPassword !== password
    ) {
      onSave(password, NewPassword, ConfirmPassword);
    }
  }, [password, NewPassword, ConfirmPassword, onSave]);

  return (
    <div className="flex flex-col gap-1">
      <div className="space-y-2 min-w-[300px]">
        <Label htmlFor={id}>Enter your current password</Label>
        <div className="relative">
          <Input1
            id={id}
            className="w-full p-2 mb-2 border rounded text-black/80 bg-white"
            placeholder={"Current password"}
            type={isVisibleCurrent ? "text" : "password"}
            value={password}
            onChange={(e) =>
              setPassword(e.target.value.replace(forbiddenCharsRegex, ""))
            }
          />
          <button
            className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg text-black/80 outline-offset-2 transition-colors hover:text-black focus:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
            type="button"
            onClick={() => setIsVisibleCurrent((v) => !v)}
            aria-label={isVisibleCurrent ? "Hide password" : "Show password"}
            aria-pressed={isVisibleCurrent}
            aria-controls={id}
            tabIndex={-1}
          >
            {isVisibleCurrent ? (
              <EyeOff size={16} strokeWidth={2} aria-hidden="true" />
            ) : (
              <Eye size={16} strokeWidth={2} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
      <div className="space-y-2 min-w-[300px]">
        <Label htmlFor={id}>Enter your new password</Label>
        <div className="relative">
          <Input1
            id={id}
            className={`w-full p-2 mb-2 border rounded text-black/80 bg-white ${
              isNewPasswordTooShort || isNewPasswordSameAsCurrent
                ? "border-red-500 text-red-500"
                : ""
            }`}
            placeholder={"New password"}
            type={isVisibleNew ? "text" : "password"}
            value={NewPassword}
            onChange={(e) =>
              setNewPassword(e.target.value.replace(forbiddenCharsRegex, ""))
            }
          />
          <button
            className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg text-black/80 outline-offset-2 transition-colors hover:text-black focus:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
            type="button"
            onClick={() => setIsVisibleNew((v) => !v)}
            aria-label={isVisibleNew ? "Hide password" : "Show password"}
            aria-pressed={isVisibleNew}
            aria-controls={id}
            tabIndex={-1}
          >
            {isVisibleNew ? (
              <EyeOff size={16} strokeWidth={2} aria-hidden="true" />
            ) : (
              <Eye size={16} strokeWidth={2} aria-hidden="true" />
            )}
          </button>
        </div>
        {isNewPasswordTooShort && (
          <p className="text-red-500 text-xs mt-1">
            Password must be at least 8 characters long
          </p>
        )}
        {isNewPasswordSameAsCurrent && (
          <p className="text-red-500 text-xs mt-1">
            New password must be different from current password
          </p>
        )}
      </div>
      <div className="space-y-2 min-w-[300px]">
        <Label htmlFor={id}>Confirm your new password</Label>
        <div className="relative">
          <Input1
            id={id}
            className={`w-full p-2 mb-2 border rounded text-black/80 bg-white ${
              isConfirmPasswordTooShort || isConfirmPasswordMismatch
                ? "border-red-500 text-red-500"
                : ""
            }`}
            placeholder={"Confirm new password"}
            type={isVisibleConfirm ? "text" : "password"}
            value={ConfirmPassword}
            onChange={(e) =>
              setConfirmPassword(
                e.target.value.replace(forbiddenCharsRegex, ""),
              )
            }
          />
          <button
            className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg text-black/80 outline-offset-2 transition-colors hover:text-black focus:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
            type="button"
            onClick={() => setIsVisibleConfirm((v) => !v)}
            aria-label={isVisibleConfirm ? "Hide password" : "Show password"}
            aria-pressed={isVisibleConfirm}
            aria-controls={id}
            tabIndex={-1}
          >
            {isVisibleConfirm ? (
              <EyeOff size={16} strokeWidth={2} aria-hidden="true" />
            ) : (
              <Eye size={16} strokeWidth={2} aria-hidden="true" />
            )}
          </button>
        </div>
        {isConfirmPasswordMismatch && (
          <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
        )}
        {isConfirmPasswordTooShort && (
          <p className="text-red-500 text-xs mt-1">
            Password must be at least 8 characters long
          </p>
        )}
      </div>
    </div>
  );
}

export { InputPasswords };
