"use client";
import { useState } from "react";
import { Icon } from "./icons";

export function PasswordInput({ name, placeholder, required = false, minLength, autoComplete }: { name: string; placeholder: string; required?: boolean; minLength?: number; autoComplete?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="pw">
      <input name={name} type={show ? "text" : "password"} placeholder={placeholder} required={required} minLength={minLength} autoComplete={autoComplete} />
      <button type="button" aria-label={show ? "Hide password" : "Show password"} onClick={() => setShow(!show)}><Icon name="eye" /></button>
    </div>
  );
}
