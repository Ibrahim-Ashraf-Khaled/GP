import { Metadata } from 'next';
import { supabaseService } from '@/services/supabaseService';
import ClientPropertyDetails from './client';
import { notFound } from 'next/navigation';
import { Property } from '@/types';

// Fetch property data helper
async function getProperty(id: string): Promise<Property | null> {
    const propertyRow = await supabaseService.getPropertyById(id);

    if (!propertyRow) return null;

    // Map Supabase row to App Property type
    return {
        id: propertyRow.id,
        title: propertyRow.title,
        description: propertyRow.description || '',
        price: propertyRow.price,
        priceUnit: propertyRow.price_unit || 'يوم',
        category: propertyRow.category,
        status: propertyRow.status as any,
        images: propertyRow.images || [],
        location: {
            lat: propertyRow.location_lat || 0,
            lng: propertyRow.location_lng || 0,
            address: propertyRow.address || 'جمصة',
            area: propertyRow.area || '',
        },
        ownerPhone: propertyRow.owner_phone || '',
        ownerId: propertyRow.owner_id,
        ownerName: propertyRow.owner_name || 'مالك العقار',
        features: propertyRow.features || [],
        bedrooms: propertyRow.bedrooms || 1,
        bathrooms: propertyRow.bathrooms || 1,
        area: propertyRow.floor_area || 0,
        floor: propertyRow.floor_number || 1,
        isVerified: propertyRow.is_verified,
        viewsCount: propertyRow.views_count,
        createdAt: propertyRow.created_at,
        updatedAt: propertyRow.updated_at,
    };
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const property = await getProperty(id);

    if (!property) {
        return {
            title: 'عقار غير موجود',
        };
    }

    const title = `${property.title} - ${property.price} ج.م | عقارات جمصة`;
    const description = `${property.category} للإيجار في ${property.location.address}. ${property.bedrooms} غرف، ${property.bathrooms} حمام. ${property.description.substring(0, 100)}...`;

    return {
        title: title,
        description: description,
        openGraph: {
            title: title,
            description: description,
            images: property.images.length > 0 ? [property.images[0]] : [],
        },
        twitter: {
            card: 'summary_large_image',
            title: title,
            description: description,
            images: property.images.length > 0 ? [property.images[0]] : [],
        },
    };
}

export default async function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Increase view count (Server Action style)
    await supabaseService.incrementPropertyViews(id);

    const property = await getProperty(id);

    if (!property) {
        notFound();
    }

    return <ClientPropertyDetails initialProperty={property} />;
}
