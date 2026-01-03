
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';

export async function POST(req: Request) {
    try {
        const { name, email, mobile, password, role, providerName } = await req.json();

        if (!name || !email || !mobile || !password) {
            return NextResponse.json(
                { message: 'Name, email, mobile, and password are required' },
                { status: 400 }
            );
        }

        await dbConnect();

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { message: 'User already exists with this email' },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            mobile,
            password: hashedPassword,
            role: role || 'user',
            providerName: role === 'provider' ? providerName : undefined,
        });

        await newUser.save();

        return NextResponse.json(
            { message: 'User registered successfully' },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("Registration Error:", error);
        return NextResponse.json(
            { message: error.message || 'Something went wrong' },
            { status: 500 }
        );
    }
}
