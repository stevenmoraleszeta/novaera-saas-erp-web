import React, { useEffect, useState } from "react";
import { getUsers } from "@/services/usersService";
import { getAssignedUsersByRecord, setAssignedUsersForRecord } from "@/services/recordAssignedUsersService";
import { Button } from "@/components/ui/button";

export default function AssignedUsersSelector({ recordId, onChange, selectedUsers = [], creationMode = false }) {
  const [users, setUsers] = useState([]);
  const [assigned, setAssigned] = useState(selectedUsers);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getUsers().then(setUsers);
    if (!creationMode && recordId) getAssignedUsersByRecord(recordId).then(setAssigned);
  }, [recordId, creationMode]);

  useEffect(() => {
    if (creationMode) setAssigned(selectedUsers);
  }, [selectedUsers, creationMode]);

  const handleToggle = (userId) => {
    let updated;
    if (assigned.includes(userId)) {
      updated = assigned.filter((id) => id !== userId);
    } else {
      updated = [...assigned, userId];
    }
    setAssigned(updated);
    if (creationMode) {
      onChange?.(updated);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    await setAssignedUsersForRecord(recordId, assigned);
    setLoading(false);
    onChange?.(assigned);
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {users.map((u) => (
          <label key={u.id} className="flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={assigned.includes(u.id)}
              onChange={() => handleToggle(u.id)}
              disabled={loading}
            />
            {u.avatar_url && (
              <img src={u.avatar_url} alt={u.name} className="w-5 h-5 rounded-full" />
            )}
            <span>{u.name}</span>
          </label>
        ))}
      </div>
      {!creationMode && (
        <Button onClick={handleSave} disabled={loading} size="sm">
          {loading ? "Guardando..." : "Guardar asignados"}
        </Button>
      )}
    </div>
  );
}
