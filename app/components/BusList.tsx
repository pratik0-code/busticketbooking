import React from 'react';

export interface Bus {
    id: string;
    name: string;
    type: string;
    departureTime: string;
    arrivalTime: string;
    duration: string;
    price: number;
    rating: number;
}

interface BusListProps {
    origin: string;
    destination: string;
    onSelectBus: (bus: Bus) => void;
    onBack: () => void;
}

const MOCK_BUSES: Bus[] = [
    {
        id: '1',
        name: 'Greenline Travels',
        type: 'Sofa Seater / AC',
        departureTime: '07:00 AM',
        arrivalTime: '02:00 PM',
        duration: '7h 00m',
        price: 1500,
        rating: 4.5,
    },
    {
        id: '2',
        name: 'Blue Sky Transport',
        type: 'Deluxe / Non-AC',
        departureTime: '08:30 AM',
        arrivalTime: '03:45 PM',
        duration: '7h 15m',
        price: 900,
        rating: 3.8,
    },
    {
        id: '3',
        name: 'Sajha Yatayat',
        type: 'Standard',
        departureTime: '06:00 AM',
        arrivalTime: '01:30 PM',
        duration: '7h 30m',
        price: 700,
        rating: 4.2,
    },
    {
        id: '4',
        name: 'Luxury Express',
        type: 'VIP / Wifi / AC',
        departureTime: '09:00 AM',
        arrivalTime: '03:30 PM',
        duration: '6h 30m',
        price: 2000,
        rating: 4.8,
    },
];

const BusList: React.FC<BusListProps> = ({ origin, destination, onSelectBus, onBack }) => {
    return (
        <div className="bus-list-container">
            <div className="bus-list-header">
                <button className="back-button" onClick={onBack}>
                    <i className="fa-solid fa-arrow-left"></i>
                </button>
                <div className="route-info">
                    <h2>{origin} to {destination}</h2>
                    <span>{MOCK_BUSES.length} Buses found</span>
                </div>
            </div>

            <div className="bus-cards">
                {MOCK_BUSES.map((bus) => (
                    <div key={bus.id} className="bus-card">
                        <div className="bus-info-main">
                            <h3 className="bus-name">{bus.name}</h3>
                            <span className="bus-type">{bus.type}</span>
                            <div className="bus-rating">
                                <i className="fa-solid fa-star"></i> {bus.rating}
                            </div>
                        </div>

                        <div className="bus-schedule">
                            <div className="time-group">
                                <span className="time">{bus.departureTime}</span>
                                <span className="location">{origin}</span>
                            </div>
                            <div className="duration-line">
                                <span>{bus.duration}</span>
                                <div className="line"></div>
                            </div>
                            <div className="time-group">
                                <span className="time">{bus.arrivalTime}</span>
                                <span className="location">{destination}</span>
                            </div>
                        </div>

                        <div className="bus-action">
                            <div className="bus-price">
                                <span className="currency">NPR</span>
                                <span className="amount">{bus.price}</span>
                            </div>
                            <button className="select-seat-btn" onClick={() => onSelectBus(bus)}>
                                Select Seats
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BusList;
