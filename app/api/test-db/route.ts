import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import mongoose from 'mongoose';

export async function GET() {
    try {
        console.log('Diagnostic: Attempting DB Connection...');

        // Set a short timeout for the check
        const connPromise = dbConnect();

        // Race against a timeout
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('DB Connection Timed Out after 5s')), 5000);
        });

        await Promise.race([connPromise, timeoutPromise]);

        console.log('Diagnostic: DB Connected. State:', mongoose.connection.readyState); // 1 = connected

        const users = await User.find({}, 'name email role providerName');
        console.log('Diagnostic: Users found:', users);

        return NextResponse.json({
            status: 'ok',
            connectionState: mongoose.connection.readyState,
            userCount: users.length,
            users: users
        });
    } catch (error: any) {
        console.error('Diagnostic Error:', error);
        return NextResponse.json({
            status: 'error',
            message: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
