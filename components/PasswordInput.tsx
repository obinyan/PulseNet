"use client";
import { useState } from "react";
import { Icon } from "./icons";

export function PasswordInput({ name, placeholder }: { name: string; placeholder: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="pw">
      <input name={name} type={show ? "text" : "password"} placeholder={placeholder} />
      <button type="button" aria-label={show ? "Hide password" : "Show password"} onClick={() => setShow(!show)}><Icon name="eye" /></button>
    </div>
  );
}
