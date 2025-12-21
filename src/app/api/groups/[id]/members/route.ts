import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Group from "@/models/Group";
import User from "@/models/User";
import { getDataFromToken } from "@/helpers/getDataFromToken";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        getDataFromToken(request); // Verify auth

        const { id } = await params;
        const group = await Group.findById(id).populate('members', 'name email _id');

        if (!group) {
            return NextResponse.json({ error: "Group not found" }, { status: 404 });
        }

        return NextResponse.json(group.members);

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        getDataFromToken(request); // Verify auth
        const { email } = await request.json();

        const userToAdd = await User.findOne({ email });
        if (!userToAdd) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const { id } = await params;
        const group = await Group.findById(id);
        if (!group) {
            return NextResponse.json({ error: "Group not found" }, { status: 404 });
        }

        // Check if already member
        if (group.members.includes(userToAdd._id)) {
            return NextResponse.json({ error: "User already in group" }, { status: 400 });
        }

        group.members.push(userToAdd._id);
        await group.save();

        return NextResponse.json({
            message: "Member added",
            success: true,
            data: group
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
