import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import Booking from '@/lib/models/Booking';
import Bus from '@/lib/models/Bus';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { busId, seats, totalPrice, passengerDetails, pickupPoint, paymentMethod } = await req.json();

        if (!busId || !seats || !seats.length || !totalPrice || !passengerDetails || !pickupPoint || !paymentMethod) {
            return NextResponse.json({ message: 'Missing booking details' }, { status: 400 });
        }

        await dbConnect();

        // Optional: Check if seats are already booked (concurrency check)
        // For now, simpler implementation:

        const newBooking = await Booking.create({
            bus: busId,
            user: session.user.id,
            seats,
            totalPrice,
            pickupPoint,
            passengerDetails,
            paymentMethod,
            status: 'confirmed'
        });

        return NextResponse.json({ message: 'Booking confirmed', booking: newBooking }, { status: 201 });
    } catch (error: any) {
        console.error('Booking Error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const providerId = searchParams.get('providerId');
        const busId = searchParams.get('busId');

        await dbConnect();

        // Public access: Fetch booked seats for a specific bus
        if (busId) {
            const bookings = await Booking.find({ bus: busId }).select('seats');
            // Flatten all seats into a single array
            const bookedSeats = bookings.flatMap((b: any) => b.seats);
            return NextResponse.json(bookedSeats);
        }

        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        if (providerId) {
            // Check if requester is the provider
            if (session.user.id !== providerId && session.user.role !== 'admin') {
                return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
            }

            // Find all buses owned by this provider
            const providerBuses = await Bus.find({ provider: providerId });
            const busIds = providerBuses.map(bus => bus._id);

            // Find all bookings for these buses
            const bookings = await Booking.find({ bus: { $in: busIds } })
                .populate('bus', 'name route type') // Populate bus details
                .sort({ createdAt: -1 });

            return NextResponse.json(bookings);
        } else {
            // Return user's own bookings
            const bookings = await Booking.find({ user: session.user.id })
                .populate('bus', 'name route type')
                .sort({ createdAt: -1 });
            return NextResponse.json(bookings);
        }

    } catch (error: any) {
        console.error('Fetch Bookings Error:', error);
        return NextResponse.json({ message: 'Failed to fetch bookings' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ message: 'Booking ID required' }, { status: 400 });
        }

        await dbConnect();
        const booking = await Booking.findOne({ _id: id });

        if (!booking) {
            return NextResponse.json({ message: 'Booking not found' }, { status: 404 });
        }

        // Ensure user owns the booking or is admin
        if (booking.user.toString() !== session.user.id && session.user.role !== 'admin') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        await Booking.findByIdAndDelete(id);

        return NextResponse.json({ message: 'Booking deleted successfully' });
    } catch (error: any) {
        console.error('Delete Booking Error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
