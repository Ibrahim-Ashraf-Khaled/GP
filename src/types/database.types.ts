// Supabase Database Types
// Auto-generated based on schema.sql

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string;
                    full_name: string | null;
                    avatar_url: string | null;
                    phone: string | null;
                    national_id: string | null;
                    role: 'tenant' | 'landlord' | 'admin';
                    is_verified: boolean;
                    is_admin: boolean;
                    updated_at: string;
                    created_at: string;
                };
                Insert: {
                    id: string;
                    full_name?: string | null;
                    avatar_url?: string | null;
                    phone?: string | null;
                    national_id?: string | null;
                    role?: 'tenant' | 'landlord' | 'admin';
                    is_verified?: boolean;
                    is_admin?: boolean;
                    updated_at?: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    full_name?: string | null;
                    avatar_url?: string | null;
                    phone?: string | null;
                    national_id?: string | null;
                    role?: 'tenant' | 'landlord' | 'admin';
                    is_verified?: boolean;
                    is_admin?: boolean;
                    updated_at?: string;
                    created_at?: string;
                };
            };
            properties: {
                Row: {
                    id: string;
                    owner_id: string;
                    title: string;
                    description: string | null;
                    price: number;
                    price_unit: 'يوم' | 'أسبوع' | 'شهر' | 'موسم';
                    category: 'شقة' | 'غرفة' | 'استوديو' | 'فيلا' | 'شاليه';
                    status: 'pending' | 'available' | 'rented' | 'rejected';
                    location_lat: number | null;
                    location_lng: number | null;
                    address: string | null;
                    area: string | null;
                    bedrooms: number;
                    bathrooms: number;
                    floor_area: number | null;
                    floor_number: number;
                    features: string[];
                    images: string[];
                    owner_phone: string | null;
                    owner_name: string | null;
                    is_verified: boolean;
                    views_count: number;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    owner_id: string;
                    title: string;
                    description?: string | null;
                    price: number;
                    price_unit?: 'يوم' | 'أسبوع' | 'شهر' | 'موسم';
                    category: 'شقة' | 'غرفة' | 'استوديو' | 'فيلا' | 'شاليه';
                    status?: 'pending' | 'available' | 'rented' | 'rejected';
                    location_lat?: number | null;
                    location_lng?: number | null;
                    address?: string | null;
                    area?: string | null;
                    bedrooms?: number;
                    bathrooms?: number;
                    floor_area?: number | null;
                    floor_number?: number;
                    features?: string[];
                    images?: string[];
                    owner_phone?: string | null;
                    owner_name?: string | null;
                    is_verified?: boolean;
                    views_count?: number;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    owner_id?: string;
                    title?: string;
                    description?: string | null;
                    price?: number;
                    price_unit?: 'يوم' | 'أسبوع' | 'شهر' | 'موسم';
                    category?: 'شقة' | 'غرفة' | 'استوديو' | 'فيلا' | 'شاليه';
                    status?: 'pending' | 'available' | 'rented' | 'rejected';
                    location_lat?: number | null;
                    location_lng?: number | null;
                    address?: string | null;
                    area?: string | null;
                    bedrooms?: number;
                    bathrooms?: number;
                    floor_area?: number | null;
                    floor_number?: number;
                    features?: string[];
                    images?: string[];
                    owner_phone?: string | null;
                    owner_name?: string | null;
                    is_verified?: boolean;
                    views_count?: number;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            bookings: {
                Row: {
                    id: string;
                    property_id: string;
                    guest_id: string;
                    check_in: string;
                    check_out: string;
                    total_price: number;
                    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    property_id: string;
                    guest_id: string;
                    check_in: string;
                    check_out: string;
                    total_price: number;
                    status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    property_id?: string;
                    guest_id?: string;
                    check_in?: string;
                    check_out?: string;
                    total_price?: number;
                    status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
                    created_at?: string;
                };
            };
            payment_requests: {
                Row: {
                    id: string;
                    user_id: string;
                    property_id: string;
                    amount: number;
                    payment_method: 'vodafone_cash' | 'instapay' | 'fawry';
                    receipt_image: string | null;
                    status: 'pending' | 'approved' | 'rejected';
                    admin_note: string | null;
                    processed_at: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    property_id: string;
                    amount: number;
                    payment_method: 'vodafone_cash' | 'instapay' | 'fawry';
                    receipt_image?: string | null;
                    status?: 'pending' | 'approved' | 'rejected';
                    admin_note?: string | null;
                    processed_at?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    property_id?: string;
                    amount?: number;
                    payment_method?: 'vodafone_cash' | 'instapay' | 'fawry';
                    receipt_image?: string | null;
                    status?: 'pending' | 'approved' | 'rejected';
                    admin_note?: string | null;
                    processed_at?: string | null;
                    created_at?: string;
                };
            };
            reviews: {
                Row: {
                    id: string;
                    property_id: string;
                    user_id: string;
                    rating: number;
                    comment: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    property_id: string;
                    user_id: string;
                    rating: number;
                    comment?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    property_id?: string;
                    user_id?: string;
                    rating?: number;
                    comment?: string | null;
                    created_at?: string;
                };
            };
            notifications: {
                Row: {
                    id: string;
                    user_id: string;
                    title: string;
                    message: string | null;
                    type: 'success' | 'info' | 'warning' | 'error';
                    is_read: boolean;
                    link: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    title: string;
                    message?: string | null;
                    type: 'success' | 'info' | 'warning' | 'error';
                    is_read?: boolean;
                    link?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    title?: string;
                    message?: string | null;
                    type?: 'success' | 'info' | 'warning' | 'error';
                    is_read?: boolean;
                    link?: string | null;
                    created_at?: string;
                };
            };
            favorites: {
                Row: {
                    user_id: string;
                    property_id: string;
                    created_at: string;
                };
                Insert: {
                    user_id: string;
                    property_id: string;
                    created_at?: string;
                };
                Update: {
                    user_id?: string;
                    property_id?: string;
                    created_at?: string;
                };
            };
            unlocked_properties: {
                Row: {
                    user_id: string;
                    property_id: string;
                    unlocked_at: string;
                };
                Insert: {
                    user_id: string;
                    property_id: string;
                    unlocked_at?: string;
                };
                Update: {
                    user_id?: string;
                    property_id?: string;
                    unlocked_at?: string;
                };
            };
        };
        Views: Record<string, never>;
        Functions: Record<string, never>;
        Enums: Record<string, never>;
    };
}

// Type aliases for easier use
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Property = Database['public']['Tables']['properties']['Row'];
export type Booking = Database['public']['Tables']['bookings']['Row'];
export type PaymentRequest = Database['public']['Tables']['payment_requests']['Row'];
export type Review = Database['public']['Tables']['reviews']['Row'];
export type Notification = Database['public']['Tables']['notifications']['Row'];
export type Favorite = Database['public']['Tables']['favorites']['Row'];
