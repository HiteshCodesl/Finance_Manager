import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import { prisma } from "../lib/prisma.js";

export const dashboardRouter = express.Router();

dashboardRouter.get("/summary", authMiddleware, async (req, res) => {
  try {
    const userId = req.user!.id;

    const records = await prisma.record.findMany({
      where: {
        userId,
        deletedAt: null
      },
      select: {
        amount: true,
        type: true
      }
    });

    let income = 0;
    let expense = 0;

    for (let i of records) {
      if (i.type === "INCOME") income += i.amount;
      else expense += i.amount;
    }

    res.json({
      success: true,
      data: {
        income,
        expense,
        balance: income - expense
      }
    });

  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

dashboardRouter.get("/category-breakdown", authMiddleware, async (req, res) => {
  try {
    const userId = req.user!.id;

    const records = await prisma.record.findMany({
      where: {
        userId,
        deletedAt: null
      },
      select: {
        amount: true,
        category: true,
        type: true
      }
    });

    const result: any = {};

    for (let r of records) {
      const key = `${r.type}_${r.category}`;

      if (!result[key]) {
        result[key] = {
          category: r.category,
          type: r.type,
          total: 0
        };
      }

      result[key].total += r.amount;
    }

    res.json({ success: true, data: Object.values(result) });

  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

dashboardRouter.get("/trends", authMiddleware, async (req, res) => {
  try {
    const userId = req.user!.id;

    const records = await prisma.record.findMany({
      where: {
        userId,
        deletedAt: null
      },
      orderBy: { date: "asc" },
      select: {
        amount: true,
        type: true,
        date: true
      }
    });

    const trends: any = {};

    for (let r of records) {
      const day = r.date.toISOString().split("T")[0];

      if(!day){
        return;
      }

      if (!trends[day]) {
        trends[day] = { income: 0, expense: 0 };
      }

      if (r.type === "INCOME") trends[day].income += r.amount;
      else trends[day].expense += r.amount;
    }

    res.json({
      success: true,
      data: trends
    });

  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

dashboardRouter.get("/recent", authMiddleware, async (req, res) => {
  try {
    const userId = req.user!.id;

    const records = await prisma.record.findMany({
      where: {
        userId,
        deletedAt: null
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 5
    });

    res.json({
      success: true,
      data: records
    });

  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});