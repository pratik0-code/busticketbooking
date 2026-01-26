import mongoose from 'mongoose';

if (process.env.NODE_ENV === 'development') {
    delete mongoose.models.Bus;
}

const BusSchema = new mongoose.Schema({
    provider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    plateNumber: {
        type: String,
        required: true,
    },
    date: {
        type: String, // Format: YYYY-MM-DD
        required: true,
    },
    type: {
        type: String, // e.g., "Sofa", "Deluxe"
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    pickupPoints: {
        type: [String],
        default: [],
    },
    route: {
        origin: { type: String, required: true },
        destination: { type: String, required: true },
        departureTime: { type: String, required: true }, // Keeping as string for simplicity like '07:00 AM' or use Date
        arrivalTime: { type: String, required: true },
        duration: String,
    },
    totalSeats: {
        type: Number,
        default: 40,
    },
    rating: {
        type: Number,
        default: 0,
    }
}, { timestamps: true });

export default mongoose.models.Bus || mongoose.model('Bus', BusSchema);
