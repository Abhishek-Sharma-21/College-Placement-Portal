import { prisma } from "../config/prisma.js";

// Fetch audit log history (TPO only)
export const getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, action } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const where = {};
    if (action) {
      where.action = action;
    }

    const [total, logs] = await prisma.$transaction([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: { id: true, fullName: true, email: true, role: true },
          },
        },
        orderBy: { timestamp: "desc" },
        skip,
        take: limitNum,
      }),
    ]);

    res.status(200).json({
      logs: logs.map((l) => ({
        ...l,
        _id: l.id,
      })),
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    res.status(500).json({ message: "Server error while fetching audit logs." });
  }
};
