import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styles from './SeatSelectionDialog.module.css';

interface SeatSelectionDialogProps {
    isOpen: boolean;
    onClose: () => void;
    busDetails: {
        id: string;
        name: string;
        price: number;
        pickupPoints?: string[];
    } | null;
}

const SeatSelectionDialog: React.FC<SeatSelectionDialogProps> = ({ isOpen, onClose, busDetails }) => {
    const { data: session } = useSession();
    const router = useRouter();
    const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
    const [bookedSeats, setBookedSeats] = useState<string[]>([]);
    const [selectedPickup, setSelectedPickup] = useState('');
    const [isBooking, setIsBooking] = useState(false);

    // Mock seat data: 10 rows, columns A, B (left) and C, D (right)
    const rows = 10;
    const columns = ['A', 'B', 'C', 'D'];

    // Use price from props, or default to 0 if null
    const ticketPrice = busDetails?.price || 0;

    // Fetch booked seats when dialog opens
    React.useEffect(() => {
        if (isOpen && busDetails?.id) {
            fetch(`/api/bookings?busId=${busDetails.id}`)
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        setBookedSeats(data);
                    }
                })
                .catch(err => console.error(err));

            // Reset state
            setSelectedSeats([]);
            if (busDetails.pickupPoints && busDetails.pickupPoints.length > 0) {
                setSelectedPickup(busDetails.pickupPoints[0]);
            } else {
                setSelectedPickup('');
            }
        }
    }, [isOpen, busDetails]);

    const handleSeatClick = (seatId: string) => {
        if (bookedSeats.includes(seatId)) return; // Prevent selecting booked seats

        if (selectedSeats.includes(seatId)) {
            setSelectedSeats(selectedSeats.filter(id => id !== seatId));
        } else {
            setSelectedSeats([...selectedSeats, seatId]);
        }
    };

    const handleConfirmBooking = async () => {
        if (!session || !busDetails || selectedSeats.length === 0) return;

        // Validation for pickup point
        const pickupPoint = selectedPickup || 'Kathmandu (Default)';

        setIsBooking(true);
        try {
            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    busId: busDetails.id,
                    seats: selectedSeats,
                    totalPrice: selectedSeats.length * ticketPrice,
                    pickupPoint,
                    passengerDetails: {
                        name: session.user.name,
                        mobile: session.user.mobile || 'N/A'
                    }
                }),
            });

            if (res.ok) {
                alert('Booking Confirmed! Thank you for booking.');
                onClose();
                setSelectedSeats([]);
                router.refresh();
            } else {
                const err = await res.json();
                alert(err.message || 'Booking failed.');
            }
        } catch (error) {
            console.error('Booking Error:', error);
            alert('An error occurred during booking.');
        } finally {
            setIsBooking(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.dialogOverlay}>
            <div className={styles.dialogContent}>
                <div className={styles.dialogHeader}>
                    <h3>Select your seats</h3>
                    <button className={styles.closeButton} onClick={onClose}>
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <div className={styles.seatMapContainer}>
                    <div className={styles.driverArea}>
                        <div className={styles.steeringWheel}>
                            <i className="fa-solid fa-dharmachakra"></i>
                        </div>
                    </div>

                    <div className={styles.seatsGrid}>
                        {Array.from({ length: rows }).map((_, rowIndex) => (
                            <div key={rowIndex} className={styles.seatRow}>
                                <div className={styles.seatGroupLeft}>
                                    {['A', 'B'].map((col) => {
                                        const seatId = `${rowIndex + 1}${col}`;
                                        const isSelected = selectedSeats.includes(seatId);
                                        const isBooked = bookedSeats.includes(seatId);
                                        return (
                                            <button
                                                key={seatId}
                                                className={`${styles.seat} ${isSelected ? styles.selected : ''} ${isBooked ? styles.booked : ''}`}
                                                onClick={() => handleSeatClick(seatId)}
                                                disabled={isBooked}
                                                title={`Seat ${seatId}${isBooked ? ' (Booked)' : ''}`}
                                            >
                                                <i className="fa-solid fa-couch"></i>
                                                <span className={styles.seatNumber}>{seatId}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                                <div className={styles.aisle}></div>
                                <div className={styles.seatGroupRight}>
                                    {['C', 'D'].map((col) => {
                                        const seatId = `${rowIndex + 1}${col}`;
                                        const isSelected = selectedSeats.includes(seatId);
                                        const isBooked = bookedSeats.includes(seatId);
                                        return (
                                            <button
                                                key={seatId}
                                                className={`${styles.seat} ${isSelected ? styles.selected : ''} ${isBooked ? styles.booked : ''}`}
                                                onClick={() => handleSeatClick(seatId)}
                                                disabled={isBooked}
                                                title={`Seat ${seatId}${isBooked ? ' (Booked)' : ''}`}
                                            >
                                                <i className="fa-solid fa-couch"></i>
                                                <span className={styles.seatNumber}>{seatId}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className={styles.seatLegend}>
                        <div className={styles.legendItem}>
                            <span className={`${styles.seatSample} ${styles.available}`}></span>
                            <span>Available</span>
                        </div>
                        <div className={styles.legendItem}>
                            <span className={`${styles.seatSample} ${styles.selected}`}></span>
                            <span>Selected</span>
                        </div>
                        <div className={styles.legendItem}>
                            <span className={`${styles.seatSample} ${styles.booked}`}></span>
                            <span>Booked</span>
                        </div>
                    </div>
                </div>

                <div className={styles.dialogFooter}>
                    <div className={styles.selectedInfo}>
                        {/* Pickup Point Selection */}
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px', fontWeight: 600 }}>Pickup Point</label>
                            {busDetails?.pickupPoints && busDetails.pickupPoints.length > 0 ? (
                                <select
                                    value={selectedPickup}
                                    onChange={(e) => setSelectedPickup(e.target.value)}
                                    style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', width: '100%' }}
                                >
                                    {busDetails.pickupPoints.map((point: string) => (
                                        <option key={point} value={point}>{point}</option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    value={selectedPickup}
                                    onChange={(e) => setSelectedPickup(e.target.value)}
                                    placeholder="Enter pickup location"
                                    style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', width: '100%' }}
                                />
                            )}
                        </div>

                        {selectedSeats.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span>Selected: {selectedSeats.join(', ')}</span>
                                <span>Passenger: {session?.user?.name}</span>
                                <span style={{ fontWeight: 700, fontSize: '1.1em', color: 'var(--color-primary)' }}>
                                    Total: NRs. {selectedSeats.length * ticketPrice}
                                </span>
                            </div>
                        ) : (
                            <span>No seats selected</span>
                        )}
                    </div>
                    <div className={styles.dialogActions}>
                        <button className={styles.btnCancel} onClick={onClose}>Cancel</button>
                        <button
                            className={styles.btnConfirm}
                            onClick={handleConfirmBooking}
                            disabled={isBooking || selectedSeats.length === 0}
                            style={{ opacity: isBooking || selectedSeats.length === 0 ? 0.7 : 1 }}
                        >
                            {isBooking ? 'Booking...' : 'Confirm Booking'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SeatSelectionDialog;
