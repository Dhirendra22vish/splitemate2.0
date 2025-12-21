import { NextRequest, NextResponse } from "next/server";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import connectDB from "@/lib/db";
import Notification from "@/models/Notification";

export async function PUT(request: NextRequest) {
    try {
        const userId = await getDataFromToken(request);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        // Mark ALL as read for now
        await Notification.updateMany(
            { recipient: userId, read: false },
            { $set: { read: true } }
        );

        return NextResponse.json({
            success: true,
            message: "All notifications marked as read"
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
