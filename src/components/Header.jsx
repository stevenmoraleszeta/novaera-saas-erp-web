"use client";

import React, { useContext } from "react";
import { Settings, Bell, Edit3, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AuthContext } from "../context/AuthContext";
import { useEditMode } from "../context/EditModeContext";
import Link from "next/link";

export default function Header() {
  const { user } = useContext(AuthContext);
  const { isEditingMode, toggleEditMode } = useEditMode();

  return (
    <header className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <Link href="/">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          ERPLOGO
        </h1>
      </Link>
      <div className="flex items-center space-x-2">
        {/* Edit Mode Toggle */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isEditingMode ? "default" : "outline"}
                size="icon"
                onClick={toggleEditMode}
                className={
                  isEditingMode ? "bg-green-600 hover:bg-green-700" : ""
                }
              >
                {isEditingMode ? (
                  <Edit3 className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {isEditingMode
                  ? "Modo edición activo"
                  : "Cambiar a modo edición"}
              </p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Configuración</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon">
                <Bell className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Notificaciones</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Avatar className="w-8 h-8">
                <AvatarImage
                  src="https://github.com/shadcn.png"
                  alt="@shadcn"
                />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>
              <p>Mi Perfil</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </header>
  );
}
