import React from "react";
import {
  DialogHeader as DialogHeaderPrimitive,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export function DialogHeader({
  icon: Icon,
  title,
  description,
  iconColor = "text-white",
  titleClassName = "",
  descriptionClassName = "",
}) {
  return (
    <DialogHeaderPrimitive>
      <div className="flex items-center gap-3">
        {Icon && (
          <div className={`p-2 bg-black  rounded-lg`}>
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </div>
        )}
        <div>
          <DialogTitle
            className={`text-xl font-semibold text-gray-900 ${titleClassName}`}
          >
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription
              className={`text-sm text-gray-500 mt-1 ${descriptionClassName}`}
            >
              {description}
            </DialogDescription>
          )}
        </div>
      </div>
    </DialogHeaderPrimitive>
  );
}
