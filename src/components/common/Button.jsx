"use client";

import React from "react";
import { Button as ShadcnButton } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

/**
 * Button component with support for different variants, loading state, and icons
 *
 * Props:
 * - variant: 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'accent'
 * - type: 'button' | 'submit' | 'reset'
 * - loading: boolean
 * - disabled: boolean
 * - leftIcon: ReactNode
 * - rightIcon: ReactNode
 * - className: string
 * - children: ReactNode
 */
export default function Button({
  variant = "default",
  type = "button",
  loading,
  disabled,
  leftIcon,
  rightIcon,
  children,
  className = "",
  ...props
}) {
  const isDisabled = disabled || loading;

  return (
    <ShadcnButton
      type={type}
      variant={variant}
      disabled={isDisabled}
      className={className}
      {...props}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {!loading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      <span>{children}</span>
      {!loading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </ShadcnButton>
  );
}
