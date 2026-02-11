// Supabase Database Types
// Schema-aligned: English enum values; use translation maps for UI.

export type PropertyCategory = 'apartment' | 'villa' | 'chalet' | 'studio' | 'room';
export type PriceUnit = 'day' | 'week' | 'month' | 'season';
export type PropertyStatus = 'pending' | 'available' | 'rented' | 'rejected';

/** Arabic labels for property category (UI) */
export const CATEGORY_AR: Record<PropertyCategory, string> = {
    apartment: 'شقة',
    villa: 'فيلا',
    chalet: 'شاليه',
    studio: 'استوديو',
    room: 'غرفة',
};

/** Arabic labels for price/booking unit (UI) */
export const PRICE_UNIT_AR: Record<PriceUnit, string> = {
    day: 'يوم',
    week: 'أسبوع',
    month: 'شهر',
    season: 'موسم',
};

/** Arabic labels for property status (UI) */
export const STATUS_AR: Record<PropertyStatus, string> = {
    available: 'متاح',
    pending: 'قيد المراجعة',
    rented: 'محجوز',
    rejected: 'مرفوض',
};

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
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    full_name?: string;
                    avatar_url?: string;
                    phone?: string;
                    national_id?: string;
                    role?: 'tenant' | 'landlord' | 'admin';
                    is_verified?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    full_name?: string;
                    avatar_url?: string;
                    phone?: string;
                    national_id?: string;
                    role?: 'tenant' | 'landlord' | 'admin';
                    is_verified?: boolean;
                    updated_at?: string;
                };
            };
            properties: {
                Row: {
                    id: string;
                    owner_id: string;
                    title: string;
                    description: string | null;
                    price: number;
                    price_unit: PriceUnit;
                    category: PropertyCategory;
                    status: PropertyStatus;
                    location_lat: number | null;
                    location_lng: number | null;
                    address: string | null;
                    area: string | null;
                    bedrooms: number | null;
                    bathrooms: number | null;
                    floor_area: number | null;
                    floor_number: number | null;
                    features: string[] | null;
                    owner_phone: string | null;
                    owner_name: string | null;
                    images: string[];
                    is_verified: boolean;
                    views_count: number;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    owner_id: string;
                    title: string;
                    description?: string;
                    price: number;
                    price_unit?: PriceUnit;
                    category: PropertyCategory;
                    status?: PropertyStatus;
                    location_lat?: number;
                    location_lng?: number;
                    address?: string;
                    area?: string;
                    bedrooms?: number;
                    bathrooms?: number;
                    floor_area?: number;
                    floor_number?: number;
                    features?: string[];
                    owner_phone?: string;
                    owner_name?: string;
                    images?: string[];
                    is_verified?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    title?: string;
                    description?: string;
                    price?: number;
                    price_unit?: PriceUnit;
                    category?: PropertyCategory;
                    status?: PropertyStatus;
                    location_lat?: number;
                    location_lng?: number;
                    address?: string;
                    area?: string;
                    bedrooms?: number;
                    bathrooms?: number;
                    floor_area?: number;
                    floor_number?: number;
                    features?: string[];
                    owner_phone?: string;
                    owner_name?: string;
                    images?: string[];
                    is_verified?: boolean;
                    updated_at?: string;
                };
            };
            bookings: {
                Row: {
                    id: string;
                    property_id: string;
                    user_id: string;
                    start_date: string;
                    end_date: string;
                    total_price: number;
                    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
                    tenant_name: string;
                    tenant_phone: string;
                    tenant_email: string;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    property_id: string;
                    user_id: string;
                    start_date: string;
                    end_date: string;
                    total_price: number;
                    status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
                    tenant_name: string;
                    tenant_phone: string;
                    tenant_email: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
                    updated_at?: string;
                };
            };
            payment_requests: {
                Row: {
                    id: string;
                    user_id: string;
                    property_id: string;
                    amount: number;
                    payment_method: 'vodafone_cash' | 'instapay' | 'fawry';
                    receipt_image: string;
                    status: 'pending' | 'approved' | 'rejected';
                    admin_note: string | null;
                    created_at: string;
                    processed_at?: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    property_id: string;
                    amount: number;
                    payment_method: 'vodafone_cash' | 'instapay' | 'fawry';
                    receipt_image: string;
                    status?: 'pending' | 'approved' | 'rejected';
                    admin_note?: string;
                    created_at?: string;
                    processed_at?: string;
                };
                Update: {
                    id?: string;
                    status?: 'pending' | 'approved' | 'rejected';
                    admin_note?: string;
                    processed_at?: string;
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
                    comment?: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    rating?: number;
                    comment?: string;
                };
            };
            notifications: {
                Row: {
                    id: string;
                    user_id: string;
                    title: string;
                    message: string;
                    type: 'info' | 'success' | 'warning' | 'error';
                    link: string | null;
                    is_read: boolean;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    title: string;
                    message: string;
                    type?: 'info' | 'success' | 'warning' | 'error';
                    link?: string;
                    is_read?: boolean;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    is_read?: boolean;
                };
            };
            favorites: {
                Row: {
                    id: string;
                    user_id: string;
                    property_id: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    property_id: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                };
            };
            unlocked_properties: {
                Row: {
                    id: string;
                    user_id: string;
                    property_id: string;
                    payment_id: string;
                    unlocked_at?: string;
                };
                Insert: {
                    id?: string;
                    user_id?: string;
                    property_id?: string;
                    payment_id?: string;
                    unlocked_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    property_id?: string;
                    payment_id?: string;
                    unlocked_at?: string;
                };
            };
            conversations: {
                Row: {
                    id: string;
                    property_id: string | null;
                    buyer_id: string;
                    owner_id: string;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    property_id?: string | null;
                    buyer_id: string;
                    owner_id: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    property_id?: string | null;
                    buyer_id?: string;
                    owner_id?: string;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            messages: {
                Row: {
                    id: string;
                    conversation_id: string;
                    sender_id: string | null;
                    text: string;
                    is_read: boolean;
                    created_at: string;
                    message_type: string | null;
                    media_url: string | null;
                    duration: number | null;
                    metadata: Json | null;
                };
                Insert: {
                    id?: string;
                    conversation_id: string;
                    sender_id?: string | null;
                    text: string;
                    is_read?: boolean;
                    created_at?: string;
                    message_type?: string | null;
                    media_url?: string | null;
                    duration?: number | null;
                    metadata?: Json | null;
                };
                Update: {
                    id?: string;
                    conversation_id?: string;
                    sender_id?: string | null;
                    text?: string;
                    is_read?: boolean;
                    created_at?: string;
                    message_type?: string | null;
                    media_url?: string | null;
                    duration?: number | null;
                    metadata?: Json | null;
                };
            };
        };
        Views: Record<string, never>;
        Functions: {
            increment_views: {
                Args: {
                    property_id: string;
                };
                Returns: void;
            };
            unlock_property_with_payment: {
                Args: {
                    p_user_id: string;
                    p_property_id: string;
                    p_payment_id: string;
                };
                Returns: void;
            };
        };
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
export type UnlockedProperty = Database['public']['Tables']['unlocked_properties']['Row'];
export type Conversation = Database['public']['Tables']['conversations']['Row'];
export type Message = Database['public']['Tables']['messages']['Row'];