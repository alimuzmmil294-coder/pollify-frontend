import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Input } from "./ui/Field";

export default function PasswordInput({ className = "", ...props }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input
        type={visible ? "text" : "password"}
        className={`pr-11 ${className}`}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((value) => !value)}
        className="focus-ring absolute inset-y-0 right-0 px-3 text-[var(--color-text-faint)] hover:text-[var(--color-text)]"
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}
