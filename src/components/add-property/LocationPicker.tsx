'use client';

import '@/lib/leafletDefaultIcon';

import { useEffect, useMemo } from 'react';
import L from 'leaflet';
import type { DragEndEvent, MapOptions } from 'leaflet';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { useMediaQuery } from '@/hooks/useMediaQuery';

const GAMASA_CENTER = {
    lat: 31.4456,
    lng: 31.5477,
} as const;

type LocationValue = {
    lat: number;
    lng: number;
};

type LocationPickerProps = {
    value?: LocationValue | null;
    onLocationSelect: (location: LocationValue) => void;
};

type LeafletTouchOptions = MapOptions & {
    tap?: boolean;
};

function MapViewportSync({ value }: { value?: LocationValue | null }) {
    const map = useMap();
    const targetLat = value?.lat ?? GAMASA_CENTER.lat;
    const targetLng = value?.lng ?? GAMASA_CENTER.lng;

    useEffect(() => {
        map.setView([targetLat, targetLng], map.getZoom(), { animate: true });
    }, [map, targetLat, targetLng]);

    return null;
}

function MapClickHandler({ onSelect }: { onSelect: (location: LocationValue) => void }) {
    useMapEvents({
        click(event) {
            onSelect({
                lat: event.latlng.lat,
                lng: event.latlng.lng,
            });
        },
    });

    return null;
}

export default function LocationPicker({ value, onLocationSelect }: LocationPickerProps) {
    const isCoarsePointer = useMediaQuery('(pointer: coarse)');
    const selectedPosition = value ?? GAMASA_CENTER;

    const markerEventHandlers = useMemo(
        () => ({
            dragend(event: DragEndEvent) {
                const marker = event.target as L.Marker;
                const { lat, lng } = marker.getLatLng();

                onLocationSelect({ lat, lng });
            },
        }),
        [onLocationSelect],
    );

    const mapOptions: LeafletTouchOptions = {
        dragging: !isCoarsePointer,
        scrollWheelZoom: false,
        tap: false,
        touchZoom: isCoarsePointer ? 'center' : true,
    };

    const isUsingDefault = value == null;

    return (
        <div className="relative z-0">
            <MapContainer
                center={[selectedPosition.lat, selectedPosition.lng]}
                zoom={15}
                className="h-[350px] w-full rounded-2xl"
                {...mapOptions}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapViewportSync value={value} />
                <MapClickHandler
                    onSelect={(nextLocation) => {
                        onLocationSelect(nextLocation);
                    }}
                />
                <Marker
                    draggable
                    eventHandlers={markerEventHandlers}
                    position={[selectedPosition.lat, selectedPosition.lng]}
                />
            </MapContainer>

            <div className="mt-4 rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-4 text-blue-950 shadow-sm dark:border-blue-900/40 dark:from-blue-950/30 dark:to-cyan-950/20 dark:text-blue-100">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h3 className="text-sm font-bold md:text-base">الموقع الدقيق على الخريطة</h3>
                        <p className="mt-1 text-xs text-blue-700 dark:text-blue-200">
                            اضغط على الخريطة أو اسحب المؤشر لتحديد موقع العقار بدقة.
                        </p>
                    </div>
                    <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                            isUsingDefault
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200'
                                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200'
                        }`}
                    >
                        {isUsingDefault ? 'موقع افتراضي' : 'تم تحديده'}
                    </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-white/80 p-3 shadow-sm dark:bg-black/20">
                        <p className="text-[11px] font-medium text-blue-700 dark:text-blue-200">خط العرض</p>
                        <p className="mt-1 text-sm font-bold">{selectedPosition.lat.toFixed(6)}</p>
                    </div>
                    <div className="rounded-xl bg-white/80 p-3 shadow-sm dark:bg-black/20">
                        <p className="text-[11px] font-medium text-blue-700 dark:text-blue-200">خط الطول</p>
                        <p className="mt-1 text-sm font-bold">{selectedPosition.lng.toFixed(6)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
