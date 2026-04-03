import express from "express";
import { insertRecordSchema } from "../types/recordType.js";
import { authMiddleware } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/authorize.js";
import { prisma } from "../lib/prisma.js";
import { date } from "zod";

export const recordRouter = express.Router();


interface Record {
  id: string;
  amount: number;
  type: "INCOME"| "EXPENSE";
  category: string;
  date: Date;
  notes?: string | null;
  userId: string;
  createdAt: Date;
  deletedAt?: Date | null;
  deletedBy?: string | null;
}

recordRouter.post('/data', authMiddleware, authorizeRoles("ADMIN"), async (req, res) => {
    try {
        const parsedData = insertRecordSchema.safeParse(req.body);
        const adminId = req.user!.id;

        if (!parsedData || !parsedData.data) {
            return res.status(400).json({
                "success": true,
                "error": "Data is Incorrect, try again"
            })
        }

        const { amount, category, type, notes } = parsedData.data;

        const record = await prisma.record.create({
            data: {
                amount,
                category,
                date: new Date(),
                type,
                notes,
                userId: adminId
            }
        })

        return res.status(201).json({
            "success": true,
            "message": "Record Added Successfully",
            "record": {
                id: record.id,
                amount: record.amount,
                type: record.type,
                category: record.category,
                date: record.date,
                notes: record.notes,
                userId: record.userId,
                createdAt: record.createdAt
            }
        })

    } catch (err) {
        return res.status(400).json({
            "success": false,
            "error": "Record is not Created, try again"
        })
    }
})

recordRouter.get("/", async (req, res) => {
    try {
        const records = await prisma.record.findMany({
            where: {
                deletedAt: null
            },
            orderBy: { 
                date: "desc" 
            },
            take: 10,
        }); 

        
        return res.status(200).json({
            "success": true,
            "message": "Record Fetched Successfully",
            "record": records.map((record: Record) => ({
                id: record.id,
                amount: record.amount,
                type: record.type,
                category: record.category,
                date: record.date,
                notes: record.notes,
                userId: record.userId,
                createdAt: record.createdAt
           }))   
            })

    } catch (err: any) {
        res.status(500).json({
            success: false,
            message: err
        });
    }
});

recordRouter.patch("/:id", authMiddleware, authorizeRoles('ADMIN'), async (req, res) => {
    try {
        const id = req.params.id as string;

        const updatedRecord = await prisma.record.update({
            where: {
                id,
                deletedAt: null
            },
            data: {
                ...req.body
            }
        });

        res.json({
            "success": true,
            "message" : "Record Changed Successfully",
            "record": {
                id: updatedRecord.id,
                amount: updatedRecord.amount,
                type: updatedRecord.type,
                category: updatedRecord.category,
                date: updatedRecord.date,
                notes: updatedRecord.notes,
                userId: updatedRecord.userId,
                createdAt: updatedRecord.createdAt
            } 
        });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
});

recordRouter.patch("/delete/:id", authMiddleware, authorizeRoles('ADMIN'), async (req, res) => {
    try {
      const id  = req.params.id as string;
      const adminId = req.user!.id;

      await prisma.record.update({
        where: { 
            id: id, 
            deletedAt: null
        },
        data: {
          deletedAt: new Date(),
          deletedBy: adminId
        }
      });

      res.json({
        success: true,
        message: "Record deleted Sucessfully"
      });
    } catch (err) {
      res.status(500).json({ 
        success: false, 
        message: err 
    });
    }
  }
);