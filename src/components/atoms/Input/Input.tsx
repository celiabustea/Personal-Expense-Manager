import React, { memo } from "react";

interface InputProps {
  type: string;
  name: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required: boolean;
  className?: string;
  step?: string;
  min?: string;
}

const Input = memo(({ type, name, placeholder, value, onChange, required, className, step, min }: InputProps) => {
  return (
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      className={className || "form-input"}
      step={step}
      min={min}
    />
  );
});

Input.displayName = 'Input';

export default Input;
