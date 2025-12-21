import { NextRequest, NextResponse } from 'next/server';
import { getDataFromToken } from '@/helpers/getDataFromToken';
import connectDB from '@/lib/db';
import RecurringExpense from '@/models/RecurringExpense';
import Expense from '@/models/Expense';
import User from '@/models/User';

// Helper to calculate next run date
const calculateNextRun = (date: Date, frequency: string) => {
    const nextDate = new Date(date);
    if (frequency === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
    if (frequency === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);
    if (frequency === 'yearly') nextDate.setFullYear(nextDate.getFullYear() + 1);
    return nextDate;
};

// GET: Fetch recurring expenses AND check for due items to generate
export async function GET(req: NextRequest) {
    try {
        const userId = await getDataFromToken(req);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        // 2. Fetch all active recurring expenses where user is involved
        const recurring = await RecurringExpense.find({ paidBy: userId, active: true }).populate('group');

        const now = new Date();
        const generatedExpenses = [];

        // 3. Check and Generate Logic
        for (const item of recurring) {
            let nextRun = new Date(item.nextRunDate);

            if (now >= nextRun) {
                let loops = 0;
                while (now >= nextRun && loops < 5) {
                    const newExpense = await Expense.create({
                        description: `${item.description} (Recurring)`,
                        amount: item.amount,
                        date: nextRun,
                        paidBy: item.paidBy,
                        group: item.group,
                        splitBetween: item.splitBetween,
                        type: 'expense'
                    });

                    generatedExpenses.push(newExpense);

                    // Update next run
                    nextRun = calculateNextRun(nextRun, item.frequency);
                    loops++;
                }

                // Update the recurring item
                item.nextRunDate = nextRun;
                item.lastGeneratedDate = new Date(); // roughly now
                await item.save();
            }
        }

        // Return updated list
        const updatedRecurring = await RecurringExpense.find({ paidBy: userId }).sort({ createdAt: -1 }).populate('group');

        return NextResponse.json({
            recurring: updatedRecurring,
            generated: generatedExpenses.length
        });

    } catch (error: any) {
        console.error('Error in recurring expenses:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: Create a new recurring expense
export async function POST(req: NextRequest) {
    try {
        const userId = await getDataFromToken(req);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { description, amount, frequency, groupId, splitBetween, startDate } = body;

        await connectDB();

        // First run date logic
        const start = new Date(startDate || Date.now());

        const newRecurring = await RecurringExpense.create({
            description,
            amount,
            frequency,
            startDate: start,
            nextRunDate: start,
            paidBy: userId,
            group: groupId,
            splitBetween
        });

        return NextResponse.json(newRecurring, { status: 201 });

    } catch (error: any) {
        console.error('Error creating recurring expense:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
