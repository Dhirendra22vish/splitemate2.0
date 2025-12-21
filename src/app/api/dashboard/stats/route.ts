import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Expense from "@/models/Expense";
import { getDataFromToken } from "@/helpers/getDataFromToken";

export async function GET(request: NextRequest) {
    try {
        await dbConnect();
        const userId = getDataFromToken(request);

        // Find all expenses where user is involved
        const expenses = await Expense.find({
            $or: [
                { paidBy: userId },
                { "splitBetween.user": userId }
            ]
        });

        const balances: Record<string, number> = {};

        expenses.forEach((expense: any) => {
            const paidBy = expense.paidBy.toString();

            if (paidBy === userId) {
                // Deposit: I paid full amount to group, treat as credit to me (Owes You)
                if (expense.type === 'deposit') {
                    balances['DEPOSIT_POOL'] = (balances['DEPOSIT_POOL'] || 0) + expense.amount;
                } else {
                    // I paid, so I am owed money (positive balance)
                    expense.splitBetween.forEach((split: any) => {
                        const otherId = split.user.toString();
                        if (otherId !== userId) {
                            // They owe me
                            balances[otherId] = (balances[otherId] || 0) + split.amount;
                        }
                    });
                }
            } else {
                if (expense.type === 'deposit') return;

                // Someone else paid. Do I owe them?
                const mySplit = expense.splitBetween.find((s: any) => s.user.toString() === userId);
                if (mySplit) {
                    // I owe them
                    balances[paidBy] = (balances[paidBy] || 0) - mySplit.amount;
                }
            }
        });

        let totalYouOwe = 0;
        let totalOwesYou = 0;

        Object.values(balances).forEach((amount) => {
            if (amount > 0) {
                totalOwesYou += amount;
            } else {
                totalYouOwe += Math.abs(amount);
            }
        });

        return NextResponse.json({
            message: "Stats fetched",
            success: true,
            data: {
                totalYouOwe,
                totalOwesYou,
                balances // Optional: passing individual balances if needed later
            }
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
