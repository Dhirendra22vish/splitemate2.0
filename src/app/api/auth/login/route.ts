import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const reqBody = await request.json();
        const { email, password } = reqBody;

        // Check if user exists
        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return NextResponse.json({ error: "User does not exist" }, { status: 400 });
        }

        // Check password
        const validPassword = await bcryptjs.compare(password, user.password);
        if (!validPassword) {
            return NextResponse.json({ error: "Invalid password" }, { status: 400 });
        }

        // Create token data
        const tokenData = {
            id: user._id,
            name: user.name,
            email: user.email,
        };

        // Create token
        const token = jwt.sign(tokenData, process.env.NEXTAUTH_SECRET!, { expiresIn: "1d" });

        const response = NextResponse.json({
            message: "Login successful",
            success: true,
        });

        response.cookies.set("token", token, {
            httpOnly: true,
        });

        return response;

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
