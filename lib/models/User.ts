import mongoose from 'mongoose';

if (process.env.NODE_ENV === 'development') {
    delete mongoose.models.User;
}

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        maxlength: [60, 'Name cannot be more than 60 characters'],
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
    },
    mobile: {
        type: String,
        required: [true, 'Please provide a mobile number'],
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
    },
    role: {
        type: String,
        enum: ['user', 'provider', 'admin'],
        default: 'user',
    },
    providerName: {
        type: String, // e.g. "Greenline" if role is provider
        required: function (this: any) { return this.role === 'provider'; }
    },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
