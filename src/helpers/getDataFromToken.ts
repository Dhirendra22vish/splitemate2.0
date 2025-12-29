// src/helpers/getDataFromToken.ts
import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export const getDataFromToken = (request: NextRequest): string => {
    try {
        const token = request.cookies.get("token")?.value || "";
        if (!token) {
            throw new Error("No token found");
        }
        const secret = process.env.NEXTAUTH_SECRET;
        if (!secret) {
            throw new Error("NEXTAUTH_SECRET is missing");
        }
        const decodedToken: any = jwt.verify(token, secret);
        return decodedToken.id;
    } catch (error: any) {
        throw new Error(error.message);
    }
}
