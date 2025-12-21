import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Group from "@/models/Group";
import Expense from "@/models/Expense"; // Import Expense
import { getDataFromToken } from "@/helpers/getDataFromToken";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const { id } = await params;
        const userId = getDataFromToken(request);
        const group = await Group.findById(id).populate("members", "name email");

        if (!group) {
            return NextResponse.json({ error: "Group not found" }, { status: 404 });
        }

        const isMember = group.members.some((member: any) => member._id.toString() === userId);
        if (!isMember) {
            return NextResponse.json({ error: "Not authorized" }, { status: 403 });
        }

        // Calculate Balances
        const expenses = await Expense.find({ group: id });
        const balances: Record<string, number> = {};

        // Initialize 0
        group.members.forEach((member: any) => {
            balances[member._id.toString()] = 0;
        });

        expenses.forEach((expense: any) => {
            const paidBy = expense.paidBy.toString();
            const amount = expense.amount;

            // Creditor
            if (balances[paidBy] !== undefined) {
                balances[paidBy] += amount;
            }

            // If it's a deposit, we don't subtract from others (it's a pure credit to the payer)
            if (expense.type === 'deposit') return;

            // Debtors
            expense.splitBetween.forEach((split: any) => {
                const debtorId = split.user.toString();
                if (balances[debtorId] !== undefined) {
                    balances[debtorId] -= split.amount;
                }
            });
        });

        return NextResponse.json({
            message: "Group found",
            data: group,
            balances,
            currentUserId: userId
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const { id } = await params;
        const userId = getDataFromToken(request);

        const group = await Group.findById(id);
        if (!group) {
            return NextResponse.json({ error: "Group not found" }, { status: 404 });
        }

        // Check if user is a member
        const isMember = group.members.some((member: any) => member.toString() === userId);
        if (!isMember) {
            return NextResponse.json({ error: "Not authorized" }, { status: 403 });
        }

        // Delete all expenses associated with this group
        await Expense.deleteMany({ group: id });

        // Delete the group
        await Group.findByIdAndDelete(id);

        return NextResponse.json({
            message: "Group deleted successfully",
            success: true
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
