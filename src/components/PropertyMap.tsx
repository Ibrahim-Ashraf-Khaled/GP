'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Property } from '@/types';
import L from 'leaflet';
import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// Fix for default Leaflet icons in Next.js
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

const customIcon = new L.Icon({
    iconUrl: iconUrl,
    iconRetinaUrl: iconRetinaUrl,
    shadowUrl: shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

interface PropertyMapProps {
    properties: Property[];
    center?: [number, number];
    zoom?: number;
}

// Default center (Gamasa)
const DEFAULT_CENTER: [number, number] = [31.4456, 31.5477];

export default function PropertyMap({ properties, center = DEFAULT_CENTER, zoom = 14 }: PropertyMapProps) {
    useEffect(() => {
        // Fix Leaflet's default icon path issues
        // @ts-ignore
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl,
            iconUrl,
            shadowUrl,
        });
    }, []);

    return (
        <MapContainer
            center={center}
            zoom={zoom}
            scrollWheelZoom={true}
            className="w-full h-full rounded-2xl z-0"
            style={{ minHeight: '400px' }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {properties.map((property) => (
                <Marker
                    key={property.id}
                    position={[property.location.lat || DEFAULT_CENTER[0], property.location.lng || DEFAULT_CENTER[1]]}
                    icon={customIcon}
                >
                    <Popup className="glass-popup">
                        <div className="w-48 p-1">
                            <div className="relative h-24 w-full mb-2 rounded-lg overflow-hidden">
                                <Image
                                    src={property.images[0] || '/images/placeholder.jpg'}
                                    alt={property.title}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <h3 className="font-bold text-sm mb-1 line-clamp-1">{property.title}</h3>
                            <p className="text-primary font-bold text-xs mb-2">
                                {property.price.toLocaleString()} ج.م / {property.priceUnit}
                            </p>
                            <Link
                                href={`/property/${property.id}`}
                                className="block w-full text-center bg-primary text-white text-xs py-1.5 rounded-md hover:bg-primary/90 transition-colors"
                            >
                                عرض التفاصيل
                            </Link>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}
