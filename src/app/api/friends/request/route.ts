import { NextRequest, NextResponse } from "next/server";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import User from "@/models/User";
import dbConnect from "@/lib/db";



export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const userId = await getDataFromToken(request);
        const reqBody = await request.json();
        const { toUserId } = reqBody;

        if (!toUserId) {
            return NextResponse.json({ error: "Target user ID required" }, { status: 400 });
        }

        const targetUser = await User.findById(toUserId);
        if (!targetUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const currentUser = await User.findById(userId);

        // Check if already friends
        if (currentUser.friends.includes(toUserId)) {
            return NextResponse.json({ error: "Already friends" }, { status: 400 });
        }

        // Check if request already sent (in targetUser's friendRequests)
        const existingRequest = targetUser.friendRequests.find(
            (req: any) => req.from.toString() === userId && req.status === 'pending'
        );

        if (existingRequest) {
            return NextResponse.json({ error: "Friend request already sent" }, { status: 400 });
        }

        // Add request to target user
        targetUser.friendRequests.push({
            from: userId,
            status: 'pending'
        });

        await targetUser.save();

        // Create Notification
        const Notification = (await import("@/models/Notification")).default;
        await Notification.create({
            recipient: toUserId,
            sender: userId,
            type: 'friend_request',
            message: `${currentUser.name} sent you a friend request`,
            link: '/friends'
        });

        return NextResponse.json({
            message: "Friend request sent successfully",
            success: true
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
