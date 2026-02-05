export interface Conversation {
    id: string;
    property_id: string;
    owner_id: string;
    buyer_id: string;
    media_permission_status: 'pending' | 'granted' | 'denied';
    created_at: string;
    updated_at: string;
    property?: any; // Replace with proper Property type if available in index.ts
    owner?: Profile;
    buyer?: Profile;
    last_message?: Message;
    unread_count?: number;
}

export interface Message {
    id: string;
    conversation_id: string;
    sender_id: string;
    text?: string;
    message_type: 'text' | 'image' | 'voice' | 'system';
    media_url?: string;
    duration?: number;
    is_read: boolean;
    metadata?: Record<string, any>;
    created_at: string;
    sender?: Profile;
}

export interface Profile {
    id: string;
    full_name: string;
    avatar_url?: string;
    online_status: boolean;
    last_seen?: string;
}
