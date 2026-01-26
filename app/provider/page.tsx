"use client";

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import styles from './provider.module.css';

export default function ProviderDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [buses, setBuses] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        name: '',
        plateNumber: '',
        type: 'Deluxe',
        price: '',
        origin: 'Kathmandu',
        destination: 'Pokhara',
        date: '',
        departureTime: '',
        arrivalTime: '',
        duration: '',
        pickupPoints: '',
    });

    const [message, setMessage] = useState('');

    const [bookings, setBookings] = useState<any[]>([]);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (status === 'authenticated') {
            if (session?.user?.role !== 'provider') {
                router.push('/provider');
            } else {
                // Fetch bookings
                fetch(`/api/bookings?providerId=${session.user.id}`)
                    .then(res => res.json())
                    .then(data => {
                        if (Array.isArray(data)) setBookings(data);
                    })
                    .catch(err => console.error(err));

                // Fetch managed buses
                fetch(`/api/buses?providerId=${session.user.id}`)
                    .then(res => res.json())
                    .then(data => {
                        if (Array.isArray(data)) setBuses(data);
                    })
                    .catch(err => console.error(err));
            }
        }
    }, [status, session, router]);

    const calculateArrivalTime = (departure: string, durationStr: string) => {
        if (!departure || !durationStr) return '';

        try {
            const [depHours, depMinutes] = departure.split(':').map(Number);
            let totalMinutes = depHours * 60 + depMinutes;

            // Parse duration (e.g., "7h 30m", "8h", "45m")
            const hoursMatch = durationStr.match(/(\d+)\s*h/i);
            const minutesMatch = durationStr.match(/(\d+)\s*m/i);

            let addedMinutes = 0;
            if (hoursMatch) addedMinutes += parseInt(hoursMatch[1]) * 60;
            if (minutesMatch) addedMinutes += parseInt(minutesMatch[1]);

            if (addedMinutes === 0) return ''; // Could not parse duration

            totalMinutes += addedMinutes;

            // Normalize to 24h format (handling next day overflow conceptually, though input type=time loops)
            const newHours = Math.floor(totalMinutes / 60) % 24;
            const newMinutes = totalMinutes % 60;

            return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
        } catch (e) {
            return '';
        }
    };

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        const updatedFormData = { ...formData, [name]: value };

        if (name === 'departureTime' || name === 'duration') {
            const arrival = calculateArrivalTime(
                name === 'departureTime' ? value : formData.departureTime,
                name === 'duration' ? value : formData.duration
            );
            if (arrival) updatedFormData.arrivalTime = arrival;
        }

        setFormData(updatedFormData);
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setMessage('');

        try {
            const payload = {
                ...formData,
                pickupPoints: formData.pickupPoints.split(',').map(p => p.trim()).filter(p => p !== '')
            };

            const res = await fetch('/api/buses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                setMessage('Bus added successfully!');
                const data = await res.json();
                setBuses([...buses, data.bus]); // Add to local list
                setFormData({ ...formData, name: '', plateNumber: '', price: '', pickupPoints: '', date: '' });
            } else {
                const data = await res.json();
                setMessage(data.message || 'Failed to add bus');
            }
        } catch (err) {
            setMessage('Something went wrong');
        }
    };

    if (status === 'loading') return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>Loading...</div>;
    if (!session || session.user.role !== 'provider') return <p>Access Denied</p>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Provider Dashboard</h1>
                <p className={styles.subtitle}>Welcome back, {session.user.name}</p>
            </div>

            <div className={styles.grid}>
                {/* Left Column: Add Bus Form */}
                <div className={styles.card}>
                    <h2 className={styles.cardTitle}>Add New Bus</h2>
                    {message && <div style={{
                        padding: '0.75rem',
                        marginBottom: '1rem',
                        borderRadius: '6px',
                        background: message.includes('success') ? '#dcfce7' : '#fee2e2',
                        color: message.includes('success') ? '#166534' : '#b91c1c'
                    }}>{message}</div>}

                    <form onSubmit={handleSubmit} className={styles.formGrid}>
                        <div style={{ gridColumn: '1 / -1' }} className={styles.inputGroup}>
                            <label className={styles.label}>Bus Name / Operator</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} required className={styles.input} placeholder="e.g. Greenline Travels" />
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Plate Number</label>
                            <input type="text" name="plateNumber" value={formData.plateNumber} onChange={handleChange} required className={styles.input} placeholder="e.g. BA 3 KH 1234" />
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Bus Type</label>
                            <select name="type" value={formData.type} onChange={handleChange} className={styles.input}>
                                <option>Deluxe</option>
                                <option>AC</option>
                                <option>Sofa</option>
                                <option>VIP</option>
                            </select>
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Price (NPR)</label>
                            <input type="number" name="price" value={formData.price} onChange={handleChange} required className={styles.input} min="0" />
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Duration</label>
                            <input type="text" name="duration" value={formData.duration} onChange={handleChange} required className={styles.input} placeholder="e.g. 7h 30m" />
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Origin</label>
                            <select name="origin" value={formData.origin} onChange={handleChange} className={styles.input}>
                                <option>Kathmandu</option>
                                <option>Pokhara</option>
                                <option>Biratnagar</option>
                                <option>Chitwan</option>
                            </select>
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Destination</label>
                            <select name="destination" value={formData.destination} onChange={handleChange} className={styles.input}>
                                <option>Kathmandu</option>
                                <option>Pokhara</option>
                                <option>Biratnagar</option>
                                <option>Chitwan</option>
                            </select>
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Date</label>
                            <input type="date" name="date" value={formData.date} onChange={handleChange} required className={styles.input} />
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Departure</label>
                            <input type="time" name="departureTime" value={formData.departureTime} onChange={handleChange} required className={styles.input} />
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Arrival</label>
                            <input type="time" name="arrivalTime" value={formData.arrivalTime} onChange={handleChange} required className={styles.input} />
                        </div>

                        <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
                            <label className={styles.label}>Pickup Points (comma separated)</label>
                            <input
                                type="text"
                                name="pickupPoints"
                                value={formData.pickupPoints}
                                onChange={handleChange}
                                className={styles.input}
                                placeholder="e.g. Kalanki, Koteshwor, Suryabinayak"
                            />
                            <small style={{ color: '#6b7280' }}>Different locations where passengers can board.</small>
                        </div>

                        <button type="submit" className={styles.button}>Publish Route</button>
                    </form>
                </div>

                {/* Right Column: Your Buses (Placeholder/Local State for now) */}
                {/* Right Column: Bookings & Buses */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Bookings Section */}
                    <div className={styles.card}>
                        <h2 className={styles.cardTitle}>Recent Bookings</h2>
                        {bookings.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                                <p>No bookings received yet.</p>
                            </div>
                        ) : (
                            <div className={styles.busList}>
                                {bookings.map((booking: any) => (
                                    <div key={booking._id} className={styles.busItem} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
                                        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontWeight: '600', color: '#1f2937' }}>{booking.passengerDetails.name}</span>
                                            <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>{new Date(booking.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div style={{ fontSize: '0.9rem', color: '#4b5563' }}>
                                            <i className="fa-solid fa-phone" style={{ marginRight: '8px', color: '#9ca3af' }}></i>
                                            {booking.passengerDetails.mobile}
                                        </div>
                                        <div style={{ fontSize: '0.9rem', color: '#4b5563' }}>
                                            <i className="fa-solid fa-location-dot" style={{ marginRight: '8px', color: '#9ca3af' }}></i>
                                            Pickup: <strong>{booking.pickupPoint || 'N/A'}</strong>
                                        </div>
                                        <div style={{ width: '100%', borderTop: '1px solid #f3f4f6', paddingTop: '0.5rem', marginTop: '0.25rem', display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ fontSize: '0.85rem' }}>
                                                Bus: <strong>{booking.bus?.name || 'Unknown'}</strong>
                                            </span>
                                            <span style={{ fontSize: '0.85rem' }}>
                                                Seats: <strong>{booking.seats.join(', ')}</strong>
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Your Buses Section */}
                    <div className={styles.card}>
                        <h2 className={styles.cardTitle}>Your Managed Buses</h2>
                        {buses.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                                <p>No buses added recently.</p>
                                <small>Buses added in this session will appear here.</small>
                            </div>
                        ) : (
                            <div className={styles.busList}>
                                {buses.map((bus, idx) => (
                                    <div key={idx} className={styles.busItem}>
                                        <div>
                                            <div style={{ fontWeight: '600' }}>{bus.name}</div>
                                            <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                                                {bus.route?.origin} → {bus.route?.destination}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <span className={styles.tag}>{bus.type}</span>
                                            <div style={{ marginTop: '0.25rem', fontSize: '0.9rem' }}>NPR {bus.price}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
