import fs from 'fs';
import path from 'path';

import { Metadata } from 'next';
import { fromPropertyRow } from '@/lib/propertyMapper';
import { supabaseService } from '@/services/supabaseService';
import ClientPropertyDetails from './client';
import { notFound } from 'next/navigation';
import { Property, CATEGORY_AR } from '@/types';

const PUBLIC_DIR = path.join(process.cwd(), 'public');
const LOCAL_IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.avif'];
const PUBLIC_IMAGE_PREFIX = '/images/';

function isRemoteImage(value: string): boolean {
    return /^(https?:|\/\/|data:)/i.test(value);
}

function resolvePublicImagePath(value: string): string {
    const normalized = value.startsWith('/') ? value : `/${value}`;
    const questionIndex = normalized.indexOf('?');
    const pathOnly = questionIndex === -1 ? normalized : normalized.slice(0, questionIndex);
    const search = questionIndex === -1 ? '' : normalized.slice(questionIndex);

    if (!pathOnly.startsWith(PUBLIC_IMAGE_PREFIX)) {
        return `${pathOnly}${search}`;
    }

    const relativePath = pathOnly.slice(1);
    const resolvedPath = path.join(PUBLIC_DIR, relativePath);

    if (fs.existsSync(resolvedPath)) {
        return `${pathOnly}${search}`;
    }

    const currentExt = path.extname(pathOnly).toLowerCase();
    const basePath = currentExt ? pathOnly.slice(0, -currentExt.length) : pathOnly;

    for (const ext of LOCAL_IMAGE_EXTENSIONS) {
        if (ext === currentExt) continue;
        const candidatePathOnly = `${basePath}${ext}`;
        const candidateRelative = candidatePathOnly.slice(1);
        if (fs.existsSync(path.join(PUBLIC_DIR, candidateRelative))) {
            return `${candidatePathOnly}${search}`;
        }
    }

    return `${pathOnly}${search}`;
}

function sanitizePropertyImages(property: Property): Property {
    if (property.images.length === 0) {
        return property;
    }

    return {
        ...property,
        images: property.images.map((image) => {
            if (!image) return image;
            if (isRemoteImage(image)) return image;
            return resolvePublicImagePath(image);
        }),
    };
}

async function getProperty(id: string): Promise<Property | null> {
    const propertyRow = await supabaseService.getPropertyById(id);

    if (!propertyRow) return null;

    return sanitizePropertyImages(fromPropertyRow(propertyRow));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const property = await getProperty(id);

    if (!property) {
        return {
            title: 'ط¹ظ‚ط§ط± ط؛ظٹط± ظ…ظˆط¬ظˆط¯',
        };
    }

    const title = `${property.title} - ${property.price} ط¬.ظ… | ط¹ظ‚ط§ط±ط§طھ ط¬ظ…طµط©`;
    const description = `${CATEGORY_AR[property.category]} ظ„ظ„ط¥ظٹط¬ط§ط± ظپظٹ ${property.location.address}. ${property.bedrooms} ط؛ط±ظپطŒ ${property.bathrooms} ط­ظ…ط§ظ…. ${property.description.substring(0, 100)}...`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: property.images.length > 0 ? [property.images[0]] : [],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: property.images.length > 0 ? [property.images[0]] : [],
        },
    };
}

export default async function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    await supabaseService.incrementPropertyViews(id);

    const property = await getProperty(id);

    if (!property) {
        notFound();
    }

    return <ClientPropertyDetails key={property.id} initialProperty={property} />;
}
