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
    const [buses, setBuses] = useState<Bus[]>([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [loading, setLoading] = useState(false);

    // Seat Selection State
    const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
    const [isSeatDialogOpen, setIsSeatDialogOpen] = useState(false);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (status === 'authenticated') {
            if (session?.user?.role === 'provider') {
                router.push('/provider');
            }
        }
    }, [status, session, router]);

    const handleSearchClick = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setHasSearched(true);
        setBuses([]);

        try {
            const res = await fetch(`/api/buses?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`);
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
    if (!session) return <p>Access Denied</p>;

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
                    <div style={{ padding: '2rem', textAlign: 'center', background: '#f9fafb', borderRadius: '8px', color: '#6b7280' }}>
                        No upcoming trips scheduled.
                    </div>
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
