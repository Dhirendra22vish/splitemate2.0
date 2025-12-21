import { NextRequest, NextResponse } from "next/server";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import User from "@/models/User";
import dbConnect from "@/lib/db";

export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const userId = await getDataFromToken(request);
        const reqBody = await request.json();
        const { friendId } = reqBody;

        if (!friendId) {
            return NextResponse.json({ error: "Friend ID is required" }, { status: 400 });
        }

        const currentUser = await User.findById(userId);
        const friendUser = await User.findById(friendId);

        if (!currentUser || !friendUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Remove friend from current user's friend list
        currentUser.friends = currentUser.friends.filter(
            (id: any) => id.toString() !== friendId
        );
        await currentUser.save();

        // Remove current user from friend's friend list
        friendUser.friends = friendUser.friends.filter(
            (id: any) => id.toString() !== userId
        );
        await friendUser.save();

        return NextResponse.json({
            message: "Friend removed successfully",
            success: true
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
