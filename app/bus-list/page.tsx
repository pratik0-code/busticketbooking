"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, Suspense } from 'react';
import BusList, { Bus } from '../components/[bus-list]/BusList';
import SeatSelectionDialog from '../components/[seat-selection]/SeatSelectionDialog';

function BusListContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const origin = searchParams.get('origin') || 'Kathmandu';
    const destination = searchParams.get('destination') || 'Pokhara';

    const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
    const [isSeatDialogOpen, setIsSeatDialogOpen] = useState(false);

    const handleBack = () => {
        router.back();
    };

    const handleSelectBus = (bus: Bus) => {
        setSelectedBus(bus);
        setIsSeatDialogOpen(true);
    };

    return (
        <>
            <BusList
                buses={[]}
                origin={origin}
                destination={destination}
                onSelectBus={handleSelectBus}
                onBack={handleBack}
            />

            <SeatSelectionDialog
                isOpen={isSeatDialogOpen}
                onClose={() => setIsSeatDialogOpen(false)}
                busDetails={selectedBus}
            />
        </>
    );
}

export default function BusListPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <BusListContent />
        </Suspense>
    );
}
