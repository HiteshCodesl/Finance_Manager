import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken"

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(400).json({
            "success": false,
            "error": "Invalid token"
        })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    console.log("decoded", decoded.id, decoded.role)
    if(decoded) {  
        req.user = {
            id: decoded.id,
            role: decoded.role
        }
        console.log("auth successful", req.user!.id, req.user!.role);
        next();
    }else {
        return res.status(400).json({
        "success": false,
        "error": "Auth failed"
        })
    }
}