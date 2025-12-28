import React, { useState } from 'react';

interface SeatSelectionDialogProps {
    isOpen: boolean;
    onClose: () => void;
    busDetails: {
        name: string;
        price: number;
    } | null;
}

const SeatSelectionDialog: React.FC<SeatSelectionDialogProps> = ({ isOpen, onClose, busDetails }) => {
    const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

    // Mock seat data: 10 rows, columns A, B (left) and C, D (right)
    const rows = 10;
    const columns = ['A', 'B', 'C', 'D'];

    // Use price from props, or default to 0 if null
    const ticketPrice = busDetails?.price || 0;

    const handleSeatClick = (seatId: string) => {
        if (selectedSeats.includes(seatId)) {
            setSelectedSeats(selectedSeats.filter(id => id !== seatId));
        } else {
            setSelectedSeats([...selectedSeats, seatId]);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="dialog-overlay">
            <div className="dialog-content">
                <div className="dialog-header">
                    <h3>Select your seats</h3>
                    <button className="close-button" onClick={onClose}>
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <div className="seat-map-container">
                    <div className="driver-area">
                        <div className="steering-wheel">
                            <i className="fa-solid fa-dharmachakra"></i>
                        </div>
                    </div>

                    <div className="seats-grid">
                        {Array.from({ length: rows }).map((_, rowIndex) => (
                            <div key={rowIndex} className="seat-row">
                                <div className="seat-group-left">
                                    {['A', 'B'].map((col) => {
                                        const seatId = `${rowIndex + 1}${col}`;
                                        const isSelected = selectedSeats.includes(seatId);
                                        return (
                                            <button
                                                key={seatId}
                                                className={`seat ${isSelected ? 'selected' : ''}`}
                                                onClick={() => handleSeatClick(seatId)}
                                                title={`Seat ${seatId}`}
                                            >
                                                <i className="fa-solid fa-couch"></i>
                                                <span className="seat-number">{seatId}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                                <div className="aisle"></div>
                                <div className="seat-group-right">
                                    {['C', 'D'].map((col) => {
                                        const seatId = `${rowIndex + 1}${col}`;
                                        const isSelected = selectedSeats.includes(seatId);
                                        return (
                                            <button
                                                key={seatId}
                                                className={`seat ${isSelected ? 'selected' : ''}`}
                                                onClick={() => handleSeatClick(seatId)}
                                                title={`Seat ${seatId}`}
                                            >
                                                <i className="fa-solid fa-couch"></i>
                                                <span className="seat-number">{seatId}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="seat-legend">
                        <div className="legend-item">
                            <span className="seat-sample available"></span>
                            <span>Available</span>
                        </div>
                        <div className="legend-item">
                            <span className="seat-sample selected"></span>
                            <span>Selected</span>
                        </div>
                        <div className="legend-item">
                            <span className="seat-sample booked"></span>
                            <span>Booked</span>
                        </div>
                    </div>
                </div>

                <div className="dialog-footer">
                    <div className="selected-info">
                        {selectedSeats.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span>Selected: {selectedSeats.join(', ')}</span>
                                <span style={{ fontWeight: 700, fontSize: '1.1em', color: 'var(--color-primary)' }}>
                                    Total: NRs. {selectedSeats.length * ticketPrice}
                                </span>
                            </div>
                        ) : (
                            <span>No seats selected</span>
                        )}
                    </div>
                    <div className="dialog-actions">
                        <button className="btn-cancel" onClick={onClose}>Cancel</button>
                        <button className="btn-confirm" onClick={onClose}>Confirm Selection</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SeatSelectionDialog;
