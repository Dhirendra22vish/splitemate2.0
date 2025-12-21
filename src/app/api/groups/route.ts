import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Group from "@/models/Group";
import Expense from "@/models/Expense";
import { getDataFromToken } from "@/helpers/getDataFromToken";

export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const userId = getDataFromToken(request);
        const reqBody = await request.json();
        const { name } = reqBody;

        if (!name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        const newGroup = new Group({
            name,
            creator: userId,
            members: [userId]
        });

        const savedGroup = await newGroup.save();

        return NextResponse.json({
            message: "Group created successfully",
            success: true,
            group: savedGroup
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        await dbConnect();
        const userId = getDataFromToken(request);

        // Find groups where user is a member
        const groups = await Group.find({ members: userId });

        // Calculate balance for each group
        const groupIds = groups.map((g: any) => g._id);
        const expenses = await Expense.find({ group: { $in: groupIds } });

        const groupsWithBalance = groups.map((group: any) => {
            const groupExpenses = expenses.filter((e: any) => e.group.toString() === group._id.toString());
            let balance = 0;

            groupExpenses.forEach((expense: any) => {
                const paidBy = expense.paidBy.toString();

                if (paidBy === userId) {
                    if (expense.type === 'deposit') {
                        balance += expense.amount;
                    } else {
                        // I paid, so I am owed money (positive balance)
                        // I am owed the total amount minus my share (if any)
                        // But easier: Iterate splits to see who owes me.
                        expense.splitBetween.forEach((split: any) => {
                            if (split.user.toString() !== userId) {
                                balance += split.amount;
                            }
                        });
                    }
                } else {
                    if (expense.type === 'deposit') return; // Skip deposits by others (no debt)

                    // Someone else paid. Do I owe them?
                    const mySplit = expense.splitBetween.find((s: any) => s.user.toString() === userId);
                    if (mySplit) {
                        balance -= mySplit.amount;
                    }
                }
            });

            return {
                ...group.toObject(),
                balance
            };
        });

        return NextResponse.json({
            message: "Groups fetched successfully",
            success: true,
            groups: groupsWithBalance
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
