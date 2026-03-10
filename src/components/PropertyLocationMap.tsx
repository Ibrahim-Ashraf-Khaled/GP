'use client';

import '@/lib/leafletDefaultIcon';

import { MapContainer, Marker, TileLayer } from 'react-leaflet';

type PropertyLocationMapProps = {
    lat: number;
    lng: number;
    title: string;
    address: string;
};

export default function PropertyLocationMap({
    lat,
    lng,
    title,
    address,
}: PropertyLocationMapProps) {
    return (
        <div className="relative z-0 h-[320px] overflow-hidden rounded-3xl border border-gray-200 shadow-sm dark:border-gray-800">
            <MapContainer
                center={[lat, lng]}
                zoom={15}
                dragging={false}
                zoomControl={false}
                scrollWheelZoom={false}
                doubleClickZoom={false}
                touchZoom={false}
                boxZoom={false}
                keyboard={false}
                className="h-full w-full"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[lat, lng]} />
            </MapContainer>

            <div className="pointer-events-none absolute inset-x-4 bottom-4 rounded-2xl border border-white/60 bg-white/90 p-3 shadow-lg backdrop-blur dark:border-white/10 dark:bg-black/75">
                <p className="text-sm font-bold text-gray-900 dark:text-white">{title}</p>
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">{address}</p>
            </div>
        </div>
    );
}
