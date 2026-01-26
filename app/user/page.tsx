"use client";

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import BusList, { Bus } from '../components/[bus-list]/BusList';
import SeatSelectionDialog from '../components/[seat-selection]/SeatSelectionDialog';
import styles from './user.module.css';

export default function UserDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();

    // Search State
    const [origin, setOrigin] = useState('Kathmandu');
    const [destination, setDestination] = useState('Pokhara');
    const [travelDate, setTravelDate] = useState('');
    const [buses, setBuses] = useState<Bus[]>([]);
    const [myBookings, setMyBookings] = useState<any[]>([]);
    const [loadingBookings, setLoadingBookings] = useState(true);
    const [hasSearched, setHasSearched] = useState(false);
    const [loading, setLoading] = useState(false);

    // Seat Selection State
    const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
    const [isSeatDialogOpen, setIsSeatDialogOpen] = useState(false);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (status === 'authenticated') {
            if (session?.user?.role !== 'provider') {
                fetchMyBookings();
            }
        }
    }, [status, session, router]);

    const fetchMyBookings = async () => {
        try {
            const res = await fetch('/api/bookings');
            if (res.ok) {
                const data = await res.json();
                setMyBookings(data);
            }
        } catch (error) {
            console.error('Failed to fetch bookings:', error);
        } finally {
            setLoadingBookings(false);
        }
    };



    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this trip? This action cannot be undone.')) return;

        try {
            const res = await fetch(`/api/bookings?id=${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                // Remove from state
                setMyBookings(prev => prev.filter(b => b._id !== id));
                alert('Trip deleted successfully');
            } else {
                const data = await res.json();
                alert(data.message || 'Failed to delete trip');
            }
        } catch (error) {
            console.error('Error deleting trip:', error);
            alert('An error occurred');
        }
    };

    const handleSearchClick = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setHasSearched(true);
        setBuses([]);

        try {
            let query = `/api/buses?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`;
            if (travelDate) {
                query += `&date=${travelDate}`;
            }
            const res = await fetch(query);
            if (res.ok) {
                const data = await res.json();
                const mappedBuses = data.map((item: any) => ({
                    id: item._id,
                    name: item.name,
                    type: item.type,
                    departureTime: item.route.departureTime,
                    arrivalTime: item.route.arrivalTime,
                    duration: item.route.duration || 'N/A',
                    price: item.price,
                    rating: item.rating || 0
                }));
                setBuses(mappedBuses);
            }
        } catch (error) {
            console.error("Failed to fetch buses", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectBus = (bus: Bus) => {
        setSelectedBus(bus);
        setIsSeatDialogOpen(true);
    };

    const handleBack = () => {
        setHasSearched(false);
        setBuses([]);
    };

    if (status === 'loading') return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>Loading...</div>;
    if (!session || session.user.role === 'provider') return (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px', color: 'red', fontWeight: 'bold', fontSize: '1.5rem' }}>
            Access Denied
        </div>
    );

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Hello, {session.user.name?.split(' ')[0]}!</h1>
                <p className={styles.subtitle}>Ready for your next journey?</p>
            </div>

            {/* Search Section */}
            {!hasSearched ? (
                <div className={styles.card}>
                    <h2 className={styles.sectionTitle}>Search for Buses</h2>
                    <form onSubmit={handleSearchClick} className={styles.searchGrid}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Origin</label>
                            <select
                                value={origin}
                                onChange={(e) => setOrigin(e.target.value)}
                                className={styles.select}
                            >
                                <option value="Kathmandu">Kathmandu</option>
                                <option value="Pokhara">Pokhara</option>
                                <option value="Biratnagar">Biratnagar</option>
                                <option value="Chitwan">Chitwan</option>
                            </select>
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Destination</label>
                            <select
                                value={destination}
                                onChange={(e) => setDestination(e.target.value)}
                                className={styles.select}
                            >
                                <option value="Kathmandu">Kathmandu</option>
                                <option value="Pokhara">Pokhara</option>
                                <option value="Biratnagar">Biratnagar</option>
                                <option value="Chitwan">Chitwan</option>
                            </select>
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Journey Date</label>
                            <input
                                type="date"
                                value={travelDate}
                                onChange={(e) => setTravelDate(e.target.value)}
                                className={styles.select}
                            />
                        </div>

                        <button type="submit" className={styles.button} disabled={loading}>
                            {loading ? 'Searching...' : 'Find Buses'}
                        </button>
                    </form>
                </div>
            ) : (
                <div style={{ marginTop: '2rem' }}>
                    <BusList
                        buses={buses}
                        origin={origin}
                        destination={destination}
                        onSelectBus={handleSelectBus}
                        onBack={handleBack}
                    />
                </div>
            )}

            {/* My Bookings Section (Only show if not searching or make it separate tab later) */}
            {!hasSearched && (
                <div className={styles.card}>
                    <h2 className={styles.sectionTitle}>My Upcoming Trips</h2>

                    {loadingBookings ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>Loading your trips...</div>
                    ) : myBookings.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center', background: '#f9fafb', borderRadius: '8px', color: '#6b7280' }}>
                            No upcoming trips scheduled.
                        </div>
                    ) : (
                        <div className={styles.bookingList}>
                            {myBookings.map((booking: any) => (
                                <div key={booking._id} className={styles.bookingCard}>
                                    <div className={styles.bookingInfo}>
                                        <div className={styles.busName}>
                                            {booking.bus?.name || 'Bus Service'}
                                        </div>
                                        <div className={styles.routeInfo}>
                                            <i className="fa-solid fa-route"></i>
                                            {booking.bus?.route?.origin || 'Origin'}
                                            <i className="fa-solid fa-arrow-right" style={{ fontSize: '0.8rem', margin: '0 8px' }}></i>
                                            {booking.bus?.route?.destination || 'Destination'}
                                        </div>
                                        <div className={styles.bookingDetails}>
                                            <div className={styles.detailItem}>
                                                <i className="fa-regular fa-calendar"></i>
                                                {new Date(booking.bus?.route?.departureTime || Date.now()).toLocaleDateString()}
                                            </div>
                                            <div className={styles.detailItem}>
                                                <i className="fa-regular fa-clock"></i>
                                                {booking.bus?.route?.departureTime ? new Date(booking.bus.route.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                                            </div>
                                            <div className={styles.detailItem}>
                                                <i className="fa-solid fa-chair"></i>
                                                {booking.seats.join(', ')}
                                            </div>
                                        </div>
                                    </div>

                                    <div className={styles.bookingStatus}>
                                        <div className={styles.statusRow}>
                                            <span className={`${styles.statusBadge} ${booking.status === 'confirmed' ? styles.statusConfirmed : styles.statusCancelled}`}>
                                                {booking.status}
                                            </span>
                                            <button
                                                className={styles.deleteBtn}
                                                onClick={() => handleDelete(booking._id)}
                                                title="Delete Trip"
                                            >
                                                <i className="fa-solid fa-trash"></i>
                                            </button>
                                        </div>
                                        <div className={styles.paymentInfo}>
                                            Paid via {booking.paymentMethod || 'N/A'}
                                        </div>
                                        <div className={styles.priceTag}>
                                            NRs. {booking.totalPrice}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <SeatSelectionDialog
                isOpen={isSeatDialogOpen}
                onClose={() => setIsSeatDialogOpen(false)}
                busDetails={selectedBus}
            />
        </div>
    );
}
