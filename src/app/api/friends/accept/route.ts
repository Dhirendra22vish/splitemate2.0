import { NextRequest, NextResponse } from "next/server";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import User from "@/models/User";
import dbConnect from "@/lib/db";



export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const userId = await getDataFromToken(request);
        const reqBody = await request.json();
        const { requestId, action } = reqBody; // action: 'accept' or 'reject'

        if (!requestId || !action) {
            return NextResponse.json({ error: "Request ID and action required" }, { status: 400 });
        }

        const currentUser = await User.findById(userId);
        if (!currentUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const requestIndex = currentUser.friendRequests.findIndex(
            (req: any) => req._id.toString() === requestId
        );

        if (requestIndex === -1) {
            return NextResponse.json({ error: "Friend request not found" }, { status: 404 });
        }

        const friendRequest = currentUser.friendRequests[requestIndex];
        const senderId = friendRequest.from;

        if (action === 'accept') {
            // Update request status
            currentUser.friendRequests[requestIndex].status = 'accepted';

            // Add to friends list for both users
            if (!currentUser.friends.includes(senderId)) {
                currentUser.friends.push(senderId);
            }

            const sender = await User.findById(senderId);
            if (sender && !sender.friends.includes(userId)) {
                sender.friends.push(userId);
                await sender.save();
            }
        } else if (action === 'reject') {
            currentUser.friendRequests[requestIndex].status = 'rejected';
        } else {
            return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }

        // Remove the request from the array or keep it as history?
        // Let's remove it to keep the document size small, or filter it out in GET.
        // For now, let's just remove it if accepted/rejected to act as "process complete"
        // actually, schema has status, so let's keep it but filter in GET.
        // But wait, the GET /requests filters for 'pending'.
        // To prevent array bloat, let's remove it.
        currentUser.friendRequests.splice(requestIndex, 1);


        await currentUser.save();

        return NextResponse.json({
            message: `Friend request ${action}ed successfully`,
            success: true
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
