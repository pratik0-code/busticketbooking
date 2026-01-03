import React from 'react';
import styles from './BusList.module.css';

export interface Bus {
    id: string;
    name: string;
    type: string;
    departureTime: string;
    arrivalTime: string;
    duration: string;
    price: number;
    rating: number;
    pickupPoints?: string[];
}

interface BusListProps {
    buses: Bus[];
    origin: string;
    destination: string;
    onSelectBus: (bus: Bus) => void;
    onBack: () => void;
}

const BusList: React.FC<BusListProps> = ({ buses, origin, destination, onSelectBus, onBack }) => {
    return (
        <div className={styles.busListContainer}>
            <div className={styles.busListHeader}>
                <button className={styles.backButton} onClick={onBack}>
                    <i className="fa-solid fa-arrow-left"></i>
                </button>
                <div className={styles.routeInfo}>
                    <h2>{origin} to {destination}</h2>
                    <span>{buses.length} Buses found</span>
                </div>
            </div>

            <div className={styles.busCards}>
                {buses.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                        <p>No buses found for this route.</p>
                    </div>
                ) : (
                    buses.map((bus) => (
                        <div key={bus.id} className={styles.busCard}>
                            <div className={styles.busInfoMain}>
                                <h3 className={styles.busName}>{bus.name}</h3>
                                <span className={styles.busType}>{bus.type}</span>
                                <div className={styles.busRating}>
                                    <i className="fa-solid fa-star"></i> {bus.rating || 0}
                                </div>
                            </div>

                            <div className={styles.busSchedule}>
                                <div className={styles.timeGroup}>
                                    <span className={styles.time}>{bus.departureTime}</span>
                                    <span className={styles.location}>{origin}</span>
                                </div>
                                <div className={styles.durationLine}>
                                    <span>{bus.duration}</span>
                                    <div className={styles.line}></div>
                                </div>
                                <div className={styles.timeGroup}>
                                    <span className={styles.time}>{bus.arrivalTime}</span>
                                    <span className={styles.location}>{destination}</span>
                                </div>
                            </div>

                            <div className={styles.busAction}>
                                <div className={styles.busPrice}>
                                    <span className={styles.currency}>NPR</span>
                                    <span className={styles.amount}>{bus.price}</span>
                                </div>
                                <button className={styles.selectSeatBtn} onClick={() => onSelectBus(bus)}>
                                    Select Seats
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default BusList;
