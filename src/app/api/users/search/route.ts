import { NextRequest, NextResponse } from "next/server";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import User from "@/models/User";
import dbConnect from "@/lib/db";



export async function GET(request: NextRequest) {
    try {
        await dbConnect();
        const userId = await getDataFromToken(request);
        const searchParams = request.nextUrl.searchParams;
        const query = searchParams.get('q');

        if (!query) {
            return NextResponse.json({ users: [] });
        }

        const users = await User.find({
            $and: [
                { _id: { $ne: userId } },
                {
                    $or: [
                        { name: { $regex: query, $options: 'i' } },
                        { email: { $regex: query, $options: 'i' } }
                    ]
                }
            ]
        } as any).select('name email image'); // Select only necessary fields

        return NextResponse.json({
            message: "Users found",
            data: users
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
