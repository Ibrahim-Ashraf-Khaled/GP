import { Metadata } from 'next';
import { supabaseService } from '@/services/supabaseService';
import { notFound } from 'next/navigation';
import BookingPageClient from './client';

interface BookingPageProps {
  params: Promise<{ id: string }>;
}

// Server-side property data fetching
async function getPropertyData(id: string) {
  const property = await supabaseService.getPropertyById(id);
  
  if (!property) {
    notFound();
  }
  
  return property;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: BookingPageProps): Promise<Metadata> {
  const { id } = await params;
  const property = await getPropertyData(id);
  
  return {
    title: `حجز ${property.title} في ${property.address || 'جمصة'} - عقارات جمصة`,
    description: `احجز ${property.title} في ${property.address || 'جمصة'} بسعر ${property.price} جنيه. أفضل الإيجارات في جمصة.`,
    openGraph: {
      title: `حجز ${property.title}`,
      description: property.description || `احجز عقارك المثالي في جمصة`,
      images: property.images?.[0] ? [property.images[0]] : [],
      type: 'website',
    },
  };
}

export default async function BookingPage({ params }: BookingPageProps) {
  const { id } = await params;
  
  // Server-side property data fetching
  const property = await getPropertyData(id);
  
  return <BookingPageClient propertyId={id} initialProperty={property} />;
}