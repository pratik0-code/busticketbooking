import mongoose from 'mongoose';

if (process.env.NODE_ENV === 'development') {
    delete mongoose.models.Booking;
}

const BookingSchema = new mongoose.Schema({
    bus: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bus',
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    seats: {
        type: [String], // Array of seat numbers e.g. ['A1', 'B1']
        required: true,
    },
    totalPrice: {
        type: Number,
        required: true,
    },
    pickupPoint: {
        type: String,
        required: true,
    },
    passengerDetails: {
        name: { type: String, required: true },
        mobile: { type: String, required: true },
    },
    status: {
        type: String,
        enum: ['confirmed', 'cancelled'],
        default: 'confirmed',
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['Khalti', 'eSewa', 'MoBanking'],
    },
}, { timestamps: true });

export default mongoose.models.Booking || mongoose.model('Booking', BookingSchema);
