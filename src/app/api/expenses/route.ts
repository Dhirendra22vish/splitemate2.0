import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Expense from "@/models/Expense";
import Group from "@/models/Group";
import { getDataFromToken } from "@/helpers/getDataFromToken";

export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const userId = getDataFromToken(request);
        const reqBody = await request.json();
        const { description, amount, groupId, type, paidTo, paidBy, splitBetween } = reqBody;

        if (!description || !amount || !groupId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const group = await Group.findById(groupId);
        if (!group) {
            return NextResponse.json({ error: "Group not found" }, { status: 404 });
        }

        let finalSplit = [];

        if (type === 'payment') {
            // Payment Logic
            if (!paidTo) {
                return NextResponse.json({ error: "Recipient is required for payment" }, { status: 400 });
            }
            finalSplit = [{
                user: paidTo,
                amount: Number(amount)
            }];
        } else {
            // Expense Logic
            if (splitBetween && Array.isArray(splitBetween) && splitBetween.length > 0) {
                // Custom Split provided by Frontend
                // Validate total
                const splitTotal = splitBetween.reduce((sum: number, item: any) => sum + Number(item.amount), 0);
                if (Math.abs(splitTotal - Number(amount)) > 0.1) { // 0.1 tolerance for float math
                    return NextResponse.json({ error: `Split amounts (${splitTotal}) do not match total (${amount})` }, { status: 400 });
                }
                finalSplit = splitBetween;
            } else {
                // Default: Equal Split
                const splitAmount = Number(amount) / group.members.length;
                finalSplit = group.members.map((memberId: any) => ({
                    user: memberId,
                    amount: splitAmount
                }));
            }
        }

        const newExpense = new Expense({
            description,
            amount: Number(amount),
            paidBy: paidBy || userId, // Allow overriding payer
            group: groupId,
            type: type || 'expense',
            splitBetween: finalSplit
        });

        await newExpense.save();

        await newExpense.populate("paidBy", "name");

        return NextResponse.json({
            message: "Expense added",
            success: true,
            expense: newExpense
        });

    } catch (error: any) {
        console.error("Error adding expense:", error.message, error.stack);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        await dbConnect();
        getDataFromToken(request);
        const { searchParams } = new URL(request.url);
        const groupId = searchParams.get('groupId');

        if (!groupId) {
            return NextResponse.json({ error: "Group ID required" }, { status: 400 });
        }

        const expenses = await Expense.find({ group: groupId })
            .populate("paidBy", "name")
            .sort({ createdAt: -1 });

        return NextResponse.json({
            message: "Expenses fetched",
            success: true,
            expenses
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
