import express from "express";
import { loginSchema, signupSchema } from "../types/userTypes";
import { prisma } from "../lib/prisma";
import { compare, hash } from "bcrypt";
import jwt from "jsonwebtoken";
import { authMiddleware } from "../middleware/auth";
import { authorizeRoles } from "../middleware/authorize";
import { is } from "zod/locales";

const userRouter = express.Router();

type Role = "VIEWER" | "ANALYST" | "ADMIN";

interface updateData {
    role: Role,
    isActive: boolean
}

userRouter.post('/signup', async (req, res) => {
    try {
        const parsedData = signupSchema.safeParse(req.body);

        if (!parsedData || parsedData.error) {
            return res.status(404).json({
                "success": false,
                "error": "Data is Incorrect"
            })
        }

        const { name, email, password } = req.body;

        const isAlreadyUser = await prisma.user.findUnique({
            where: {
                email: email
            }
        })

        if (isAlreadyUser) {
            return res.status(404).json({
                "success": false,
                "error": "Already User, Try Login"
            })
        }

        const hashedPassword = await hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name: name,
                email: email,
                password: hashedPassword,
                role: "VIEWER"

            }
        })

        if (!user) {
            return res.status(404).json({
                "success": false,
                "error": "Failed to Signup, try again"
            })
        }

        return res.status(201).json({
            "success": true,
            "data": user
        })

    } catch (error) {
        return res.status(404).json({
            "success": false,
            "error": "Something went Wrong"
        })
    }
})

userRouter.post('/login', async (req, res) => {
    try {
        const parsedData = loginSchema.safeParse(req.body);

        if (!parsedData || parsedData.error) {
            return res.status(404).json({
                "success": false,
                "error": "Data is Incorrect"
            })
        }

        const { email, password } = parsedData.data;

        const checkUser = await prisma.user.findUnique({
            where: {
                email
            }
        })

        if (!checkUser) {
            return res.status(404).json({
                "success": false,
                "error": "User Not Exists, try signup"
            })
        }

        const checkPassword = compare(password, checkUser.password);

        if (!checkPassword) {
            return res.status(404).json({
                "success": false,
                "error": "Password or Email not Matches"
            })
        }

        const token = await jwt.sign({
            id: checkUser.id,
            role: checkUser.role
        }, process.env.JWT_SECRET!);

        return res.status(200).json({
            "success": true,
            "token": token
        })
    } catch (error) {
        return res.status(404).json({
            "success": false,
            "error": "Something went wrong, try again"
        })
    }
})

userRouter.get('/me', authMiddleware, async (req, res) => {
    const userId = req.id;
    const role = req.role;

    console.log("userId", userId)
    console.log("role", role);


    const profile = await prisma.user.findFirst({
        where: {
            id: userId
        }
    })

    if (!profile) {
        return res.status(400).json({
            "success": false,
            "error": "profile not found"
        })
    }

    return res.status(201).json({
        "success": true,
        "data": profile
    })
})

userRouter.patch("/update/:id", authMiddleware, authorizeRoles("ADMIN"), async (req, res) => {
    try {
        const id = req.params.id as string;
        const updateData: updateData = req.body;

        if (!id || !updateData.role || !updateData.isActive) {
            return res.status(400).json({
                "success": false,
                "error": "Please send a Correct details"
            })
        }

        const updatedUser = await prisma.user.update({
            where: {
                id: id
            },
            data: {
                role: updateData.role,
                isActive: updateData.isActive
            }
        });

        res.json({
            success: true,
            data: updatedUser
        });
    } catch (err) {
        return res.status(400).json({
            "success": false,
            "error": "Something went wrong, try again"
        })
    }
});

userRouter.patch("/delete/:id", authMiddleware, authorizeRoles("ADMIN"), async (req, res) => {
    try {
        const id = req.params.id as string;

        await prisma.user.update({
            where: {
                id: id
            },
            data: {
                deletedAt: new Date(),
            }
        });

        return res.json({
            success: true,
            message: "User deleted successfully"
        });

    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message || "Something went wrong"
        });
    }
}
);
