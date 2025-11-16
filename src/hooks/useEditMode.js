"use client";

import { useEffect, useState } from 'react';
import useEditModeStore from '@/stores/editModeStore';

export function useEditMode() {
  const {
    isEditingMode,
    toggleEditMode,
    setEditMode,
    resetEditMode,
    _hasHydrated,
    setHasHydrated,
    syncFromLocalStorage
  } = useEditModeStore();
  
  const [isClientSide, setIsClientSide] = useState(false);

  useEffect(() => {
    // Marcar que estamos en el cliente
    setIsClientSide(true);
    
    // Forzar sincronización desde localStorage cuando el componente se monta
    syncFromLocalStorage();
    
    // Marcar como hidratado en el store
    setHasHydrated(true);
  }, []);

  // Solo retornar el valor real después de la hidratación del cliente
  const effectiveEditMode = isClientSide && _hasHydrated ? isEditingMode : false;

  return {
    isEditingMode: effectiveEditMode,
    toggleEditMode,
    setEditMode,
    resetEditMode,
    isHydrated: isClientSide && _hasHydrated
  };
}
