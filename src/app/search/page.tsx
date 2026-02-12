import { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import { supabaseService } from '@/services/supabaseService';
import SearchPageClient from './client';
import { Property } from '@/types';

export const metadata: Metadata = {
  title: 'بحث عن عقارات في جمصة - ابحث بالسعر، المنطقة، والمساحة',
  description: 'ابحث عن شاليهات، فيلات، وشقق للإيجار في جمصة. فلتر حسب السعر، عدد الغرف، والموقع. احجز عقارك المثالي.',
  keywords: ['بحث عقارات جمصة', 'بحث شاليهات', 'فلتر عقارات', 'إيجار جمصة', 'بحث بالإيجار'],
};

// Server-side data fetching for initial load
async function getInitialProperties(searchParams: {
  q?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  bedrooms?: string;
  area?: string;
}): Promise<Property[]> {
  try {
    // Convert search params to filters
    const filters: any = {
      status: 'available',
    };

    if (searchParams.category && searchParams.category !== 'all') {
      filters.category = searchParams.category;
    }

    if (searchParams.minPrice) {
      filters.minPrice = Number(searchParams.minPrice);
    }

    if (searchParams.maxPrice) {
      filters.maxPrice = Number(searchParams.maxPrice);
    }

    if (searchParams.bedrooms) {
      filters.bedrooms = Number(searchParams.bedrooms);
    }

    if (searchParams.area && searchParams.area !== 'الكل') {
      filters.area = searchParams.area;
    }

    // Fetch properties from database
    const rows = await supabaseService.getProperties(filters);

    // Map database rows to Property type
    const properties: Property[] = rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description || '',
      price: row.price,
      priceUnit: row.price_unit || 'day',
      category: row.category,
      status: row.status,
      images: row.images || [],
      location: {
        lat: row.location_lat || 0,
        lng: row.location_lng || 0,
        address: row.address || '',
        area: row.area || '',
      },
      ownerPhone: row.owner_phone || '',
      ownerId: row.owner_id,
      ownerName: row.owner_name || '',
      features: row.features || [],
      bedrooms: row.bedrooms || 1,
      bathrooms: row.bathrooms || 1,
      area: row.floor_area || 0,
      floor: row.floor_number || 1,
      isVerified: row.is_verified,
      viewsCount: row.views_count,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    // Server-side text search filter if query provided
    if (searchParams.q) {
      const query = searchParams.q.toLowerCase();
      return properties.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.location.address.toLowerCase().includes(query) ||
        p.location.area.toLowerCase().includes(query)
      );
    }

    return properties;
  } catch (error) {
    console.error('Failed to fetch initial properties:', error);
    return [];
  }
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    bedrooms?: string;
    area?: string;
  }>;
}) {
  // Server-side data fetching for initial load
  const initialProperties = await getInitialProperties(await searchParams);

  return (
    <SearchPageClient
      initialProperties={initialProperties}
      initialSearchParams={await searchParams}
    />
  );
}