
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Bus from '@/lib/models/Bus';
import User from '@/lib/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const origin = searchParams.get('origin');
        const destination = searchParams.get('destination');
        const date = searchParams.get('date');
        const providerId = searchParams.get('providerId');

        await dbConnect();

        let query: any = {};
        if (origin) query['route.origin'] = origin;
        if (destination) query['route.destination'] = destination;
        if (date) query['date'] = date;
        if (providerId) query['provider'] = providerId;

        const buses = await Bus.find(query).populate('provider', 'name providerName');

        return NextResponse.json(buses);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        console.log("Bus POST: Session:", JSON.stringify(session, null, 2));

        if (!session || session.user.role !== 'provider') {
            console.log("Bus POST: Unauthorized access attempt. Role:", session?.user?.role);
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        console.log("Create Bus Body:", body);

        // Basic validation
        if (!body.name || !body.plateNumber || !body.price || !body.date) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        await dbConnect();

        // Nested mapping for route
        const busData = {
            provider: session.user.id,
            name: body.name,
            plateNumber: body.plateNumber,
            type: body.type,
            price: Number(body.price),
            date: body.date,
            pickupPoints: body.pickupPoints || [],
            route: {
                origin: body.origin,
                destination: body.destination,
                departureTime: body.departureTime,
                arrivalTime: body.arrivalTime,
                duration: body.duration
            }
        };

        const newBus = await Bus.create(busData);

        return NextResponse.json({ message: 'Bus created successfully', bus: newBus }, { status: 201 });

    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
