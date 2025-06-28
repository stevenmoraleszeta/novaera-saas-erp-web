// utils/notifyAssignedUser.js
import { createNotification } from "@/services/notificationService";

export async function notifyAssignedUser({ userId, action, tableName, recordId }) {
  if (!userId) return;

  const title = `Fuiste asignado a un registro`;
  const message =
    action === "created"
      ? `Has sido asignado a un nuevo registro en la tabla ${tableName}.`
      : `Se te ha reasignado un registro en la tabla ${tableName}.`;

  await createNotification({
    userId: userId,
    title,
    message,
    link_to_module: `/logical-tables/${recordId}`, // opcional, si tienes un link
  });
}
