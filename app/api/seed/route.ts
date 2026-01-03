import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import bcrypt from 'bcryptjs';

export async function GET() {
    try {
        await dbConnect();

        const hashedPassword = await bcrypt.hash('password123', 10);
        const results: any = {};

        // Check if provider exists
        let provider = await User.findOne({ email: 'provider@example.com' });
        if (!provider) {
            const hashedProviderPassword = await bcrypt.hash('provider123', 10);
            provider = await User.create({
                name: 'Greenline Travels',
                email: 'provider@example.com',
                mobile: '9841000000',
                password: hashedProviderPassword,
                role: 'provider',
                providerName: 'Greenline Travels'
            });
            results.provider = 'Provider account created';
        } else {
            results.provider = 'Provider account already exists';
        }

        // Check if user exists
        let user = await User.findOne({ email: 'user@example.com' });
        if (!user) {
            const hashedUserPassword = await bcrypt.hash('user123', 10);
            user = await User.create({
                name: 'Demo User',
                email: 'user@example.com',
                mobile: '9800000000',
                password: hashedUserPassword,
                role: 'user'
            });
            results.user = 'User account created';
        } else {
            results.user = 'User account already exists';
        }

        return NextResponse.json({
            success: true,
            results,
            credentials: {
                provider: { email: 'provider@example.com', password: 'provider123' },
                user: { email: 'user@example.com', password: 'user123' }
            }
        });

    } catch (error: any) {
        console.error('Seed Error:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
