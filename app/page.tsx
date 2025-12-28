"use client";

import { useState } from 'react';
import SeatSelectionDialog from './components/SeatSelectionDialog';
import BusList, { Bus } from './components/BusList';

type Step = 'search' | 'bus-list';

export default function HomePage() {
    const [step, setStep] = useState<Step>('search');
    const [origin, setOrigin] = useState('Kathmandu');
    const [destination, setDestination] = useState('Pokhara');

    const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
    const [isSeatDialogOpen, setIsSeatDialogOpen] = useState(false);

    const handleSearchClick = (e: React.FormEvent) => {
        e.preventDefault();
        setStep('bus-list');
    };

    const handleSelectBus = (bus: Bus) => {
        setSelectedBus(bus);
        setIsSeatDialogOpen(true);
    };

    const handleBackToSearch = () => {
        setStep('search');
        setSelectedBus(null);
    };

    return (
        <div className="page-container">
            <header className="app-header">
                <h1 className="app-logo">
                   <a href="/" className='logo'>BusTicGo<i className="fa-solid fa-bus"></i></a> 
                </h1>
                <p className="app-tagline">
                    Book the ticket. And you're good to go!
                </p>
            </header>

            {step === 'search' && (
                <form className="search-form-card" onSubmit={handleSearchClick}>
                    <h2 className="search-form-title">Find your trip</h2>
                    <div className="selection-group">
                        <div className="selection-item">
                            <label htmlFor="origin-select" className="select-label">Origin</label>
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

                        <div className="selection-item">
                            <label htmlFor="destination-select" className="select-label">Destination</label>
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

                        <button type="submit" className="search-button">
                            Search
                        </button>
                    </div>
                </form>
            )}

            {step === 'bus-list' && (
                <BusList
                    origin={origin}
                    destination={destination}
                    onSelectBus={handleSelectBus}
                    onBack={handleBackToSearch}
                />
            )}

            <SeatSelectionDialog
                isOpen={isSeatDialogOpen}
                onClose={() => setIsSeatDialogOpen(false)}
                busDetails={selectedBus}
            />
        </div>
    );
}