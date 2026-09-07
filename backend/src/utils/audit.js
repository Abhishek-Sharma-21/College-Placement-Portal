import { prisma } from "../config/prisma.js";

/**
 * Persists an administrative audit trail record in the database.
 * 
 * @param {string} userId - ID of the User executing the administrative action
 * @param {string} action - Description of the action (e.g. "CREATE_JOB", "UPDATE_APPLICATION_STATUS")
 * @param {string} resource - Identifier/URI of the resource affected (e.g. "job:uuid-1234")
 * @param {any} oldValue - Optional state of the resource before change
 * @param {any} newValue - Optional state of the resource after change
 */
export const logAudit = async (userId, action, resource, oldValue = null, newValue = null) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        resource,
        oldValue: oldValue || undefined,
        newValue: newValue || undefined,
      },
    });
  } catch (error) {
    console.error("Failed to log administrative audit trail:", error);
  }
};
