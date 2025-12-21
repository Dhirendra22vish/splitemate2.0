import { NextRequest, NextResponse } from "next/server";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import User from "@/models/User";
import dbConnect from "@/lib/db";

export async function PUT(request: NextRequest) {
    try {
        await dbConnect();
        const userId = await getDataFromToken(request);
        const reqBody = await request.json();
        const { name, image } = reqBody;

        if (!name && !image) {
            return NextResponse.json({ error: "Name or Image is required" }, { status: 400 });
        }

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (name) user.name = name;
        if (image) user.image = image;

        await user.save();

        return NextResponse.json({
            message: "Profile updated successfully",
            success: true,
            data: user
        });

    } catch (error: any) {
        console.error("API Error /users/profile:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
