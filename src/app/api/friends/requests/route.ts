import { NextRequest, NextResponse } from "next/server";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import User from "@/models/User";
import dbConnect from "@/lib/db";



export async function GET(request: NextRequest) {
    try {
        await dbConnect();
        const userId = await getDataFromToken(request);

        const user = await User.findById(userId).populate({
            path: 'friendRequests.from',
            select: 'name email image'
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const pendingRequests = user.friendRequests.filter((req: any) => req.status === 'pending');

        return NextResponse.json({
            message: "Friend requests fetched",
            data: pendingRequests
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
