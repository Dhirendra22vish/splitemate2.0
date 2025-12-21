import { NextRequest, NextResponse } from "next/server";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import User from "@/models/User";
import dbConnect from "@/lib/db";



export async function GET(request: NextRequest) {
    try {
        await dbConnect();
        const userId = await getDataFromToken(request);

        const user = await User.findById(userId).populate({
            path: 'friends',
            select: 'name email image'
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({
            message: "Friends fetched",
            data: user.friends
        });

    } catch (error: any) {
        console.error("API Error /friends:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
