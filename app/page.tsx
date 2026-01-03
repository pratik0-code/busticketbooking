"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import BusList, { Bus } from './components/[bus-list]/BusList';
import SeatSelectionDialog from './components/[seat-selection]/SeatSelectionDialog';

export default function HomePage() {
    const router = useRouter();
    const [origin, setOrigin] = useState('Kathmandu');
    const [destination, setDestination] = useState('Pokhara');
    const [buses, setBuses] = useState<Bus[]>([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [loading, setLoading] = useState(false);

    // Seat Selection State
    const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
    const [isSeatDialogOpen, setIsSeatDialogOpen] = useState(false);

    const handleSearchClick = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setHasSearched(true);
        setBuses([]); // Clear previous results

        try {
            const res = await fetch(`/api/buses?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`);
            if (res.ok) {
                const data = await res.json();
                // Map the DB data to match the Bus interface if necessary
                const mappedBuses = data.map((item: any) => ({
                    id: item._id,
                    name: item.name,
                    type: item.type,
                    departureTime: item.route.departureTime,
                    arrivalTime: item.route.arrivalTime,
                    duration: item.route.duration || 'N/A',
                    price: item.price,
                    rating: item.rating || 0,
                    pickupPoints: item.pickupPoints || []
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

    return (
        <div className={styles.pageWrapper}>
            {/* Header */}
            <header className={styles.appHeader}>
                <div className={styles.headerContent}>
                    <h1 className={styles.appLogo}>
                        <a href="/" className={styles.logo}>BusTicGo<i className="fa-solid fa-bus"></i></a>
                    </h1>
                    <nav className={styles.authNav}>
                        <a href="/login" className={styles.authLink}>Login</a>
                        <a href="/register" className={`${styles.authLink} ${styles.registerBtn}`}>Register</a>
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            {!hasSearched ? (
                <>
                    <section className={styles.heroSection}>
                        <div className={styles.heroContent}>
                            <h1 className={styles.heroTitle}>Journey with Comfort. <br />Travel with BusTicGo.</h1>
                            <p className={styles.heroSubtitle}>
                                The most reliable way to book bus tickets across Nepal.
                                Safe, secure, and always on time.
                            </p>

                            {/* Search Widget */}
                            <form className={styles.searchFormCard} onSubmit={handleSearchClick}>
                                <div className={styles.selectionGroup}>
                                    <div className={styles.selectionItem}>
                                        <label htmlFor="origin-select" className={styles.selectLabel}>Origin</label>
                                        <div className={styles.selectWrapper}>
                                            <i className="fa-solid fa-location-dot"></i>
                                            <select
                                                id="origin-select"
                                                name="origin"
                                                value={origin}
                                                onChange={(e) => setOrigin(e.target.value)}
                                            >
                                                <option value="Kathmandu">Kathmandu</option>
                                                <option value="Pokhara">Pokhara</option>
                                                <option value="Biratnagar">Biratnagar</option>
                                                <option value="Chitwan">Chitwan</option>
                                                <option value="Itahari">Itahari</option>
                                                <option value="Janakpur">Janakpur</option>
                                                <option value="Mahendranagar">Mahendranagar</option>
                                                <option value="Nepalgunj">Nepalgunj</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className={styles.selectionItem}>
                                        <label htmlFor="destination-select" className={styles.selectLabel}>Destination</label>
                                        <div className={styles.selectWrapper}>
                                            <i className="fa-solid fa-map-location-dot"></i>
                                            <select
                                                id="destination-select"
                                                name="destination"
                                                value={destination}
                                                onChange={(e) => setDestination(e.target.value)}
                                            >
                                                <option value="Kathmandu">Kathmandu</option>
                                                <option value="Pokhara">Pokhara</option>
                                                <option value="Biratnagar">Biratnagar</option>
                                                <option value="Chitwan">Chitwan</option>
                                                <option value="Itahari">Itahari</option>
                                                <option value="Janakpur">Janakpur</option>
                                                <option value="Mahendranagar">Mahendranagar</option>
                                                <option value="Nepalgunj">Nepalgunj</option>
                                            </select>
                                        </div>
                                    </div>

                                    <button type="submit" className={styles.searchButton} disabled={loading}>
                                        {loading ? 'Searching...' : 'Search Buses'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </section>

                    {/* Features Section */}
                    <section className={styles.featuresSection}>
                        <div className={styles.featuresContainer}>
                            <div className={styles.featureCard}>
                                <div className={styles.iconCircle}>
                                    <i className="fa-solid fa-ticket"></i>
                                </div>
                                <h3>Easy Booking</h3>
                                <p>Book your tickets in just 3 simple steps. No more waiting in queues.</p>
                            </div>
                            <div className={styles.featureCard}>
                                <div className={styles.iconCircle}>
                                    <i className="fa-solid fa-shield-halved"></i>
                                </div>
                                <h3>Secure Payments</h3>
                                <p>We use state-of-the-art encryption to keep your transaction details safe.</p>
                            </div>
                            <div className={styles.featureCard}>
                                <div className={styles.iconCircle}>
                                    <i className="fa-solid fa-bus-simple"></i>
                                </div>
                                <h3>Top Operators</h3>
                                <p>Choose from the best bus operators in the country for a comfortable ride.</p>
                            </div>
                        </div>
                    </section>
                </>
            ) : (
                <div style={{ paddingTop: '100px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                    <BusList
                        buses={buses}
                        origin={origin}
                        destination={destination}
                        onSelectBus={handleSelectBus}
                        onBack={handleBack}
                    />
                </div>
            )}

            {/* Dialog */}
            <SeatSelectionDialog
                isOpen={isSeatDialogOpen}
                onClose={() => setIsSeatDialogOpen(false)}
                busDetails={selectedBus}
            />

            {/* Footer */}
            <footer className={styles.footer}>
                <p>&copy; {new Date().getFullYear()} BusTicGo. All rights reserved.</p>
            </footer>
        </div>
    );
}