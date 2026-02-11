
import { supabase, STORAGE_BUCKET, uploadImage, deleteImage } from '@/lib/supabase';
import { Conversation, Message, Profile } from '@/types/messaging';

// === Mock Mode Flag ===
export const IS_MOCK_MODE = process.env.NEXT_PUBLIC_IS_MOCK_MODE === 'true';

// أنواع البيانات
export interface UserProfile {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    phone: string | null;
    role: 'مؤجر' | 'مستأجر' | 'admin';
    is_verified: boolean;
    is_admin: boolean;
}

import type { PropertyCategory, PriceUnit, PropertyStatus } from '@/types/database.types';

export interface PropertyInsert {
    title: string;
    description?: string;
    price: number;
    price_unit?: PriceUnit;
    category: PropertyCategory;
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
}

export interface PropertyRow extends PropertyInsert {
    id: string;
    owner_id: string;
    status: PropertyStatus;
    images: string[];
    is_verified: boolean;
    views_count: number;
    created_at: string;
    updated_at: string;
}

// === Mock Data ===
const MOCK_PROPERTIES: PropertyRow[] = [
    {
        id: '1',
        title: 'شقة فاخرة تطل على البحر',
        description: 'شقة رائعة بفيو مباشر على البحر، مكونة من 3 غرف وصالة كبيرة. تشطيب سوبر لوكس ومجهزة بالكامل.',
        price: 1500,
        price_unit: 'day',
        category: 'apartment',
        address: 'شارع البحر، جمصة',
        area: 'منطقة الفيلات',
        bedrooms: 3,
        bathrooms: 2,
        floor_area: 120,
        floor_number: 2,
        features: ['واي فاي', 'تكييف', 'شرفة', 'مطبخ مجهز', 'مصعد'],
        images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80'],
        owner_id: 'owner-1',
        owner_name: 'الحاج محمد',
        owner_phone: '01012345678',
        status: 'available',
        is_verified: true,
        views_count: 150,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: '2',
        title: 'شالية أرضي بحديقة خاصة',
        description: 'شالية جميل قريب من السوق ومنطقة المطاعم. به حديقة خاصة ومدخل مستقل.',
        price: 800,
        price_unit: 'day',
        category: 'chalet',
        address: 'منطقة 15 مايو',
        area: '15 مايو',
        bedrooms: 2,
        bathrooms: 1,
        floor_area: 80,
        floor_number: 0,
        features: ['حديقة', 'قريب من الخدمات', 'موقف سيارات'],
        images: ['https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=800&q=80'],
        owner_id: 'owner-2',
        owner_name: 'أم كريم',
        owner_phone: '01122334455',
        status: 'available',
        is_verified: true,
        views_count: 85,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: '3',
        title: 'ستوديو اقتصادي للطلاب',
        description: 'ستوديو صغير ومريح، مناسب للطلاب أو الأفراد. قريب من الجامعة.',
        price: 3000,
        price_unit: 'month',
        category: 'studio',
        address: 'حي الشباب',
        area: 'تقسيم الشباب',
        bedrooms: 1,
        bathrooms: 1,
        floor_area: 40,
        floor_number: 3,
        features: ['سرير', 'مكتب', 'دولاب'],
        images: ['https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=80'],
        owner_id: 'owner-1',
        owner_name: 'الحاج محمد',
        owner_phone: '01012345678',
        status: 'available',
        is_verified: false,
        views_count: 40,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: '4',
        title: 'فيلا مستقلة للعائلات الكبيرة',
        description: 'فيلا دورين بحديقة وحمام سباحة، تكفي عائلة كبيرة. قريبة من البحر.',
        price: 5000,
        price_unit: 'day',
        category: 'villa',
        address: 'منطقة الفيلات الجديدة',
        area: 'منطقة الفيلات',
        bedrooms: 5,
        bathrooms: 4,
        floor_area: 300,
        floor_number: 0,
        features: ['حمام سباحة', 'حديقة كبيرة', 'جراج', 'تكييف مركزي'],
        images: ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80'],
        owner_id: 'owner-3',
        owner_name: 'د. محمود',
        owner_phone: '01233445566',
        status: 'available',
        is_verified: true,
        views_count: 320,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }
];

// In-memory storage for mock mode changes (resets on refresh)
const _mockFavorites = new Set<string>();
const _mockUnlocked = new Set<string>();
const _mockPayments: any[] = [];

export const supabaseService = {
    // ====== Mock Auth Hub ======
    async signIn(email: string, pass: string) {
        if (IS_MOCK_MODE) {
            return {
                data: {
                    user: { id: 'mock-user-123', email: email || 'test@example.com' },
                    session: {
                        access_token: 'mock-token',
                        refresh_token: 'mock-refresh-token',
                        expires_in: 3600,
                        token_type: 'bearer',
                        user: { id: 'mock-user-123', email: email || 'test@example.com' }
                    }
                },
                error: null
            };
        }
        return await supabase.auth.signInWithPassword({ email, password: pass });
    },

    async signUp(email: string, pass: string, data?: { full_name?: string; phone?: string; role?: string }) {
        if (IS_MOCK_MODE) {
            return {
                data: {
                    user: { id: 'mock-user-123', email: email || 'test@example.com', user_metadata: data },
                    session: {
                        access_token: 'mock-token',
                        refresh_token: 'mock-refresh-token',
                        expires_in: 3600,
                        token_type: 'bearer',
                        user: { id: 'mock-user-123', email: email || 'test@example.com', user_metadata: data }
                    }
                },
                error: null
            };
        }
        return await supabase.auth.signUp({
            email,
            password: pass,
            options: { data }
        });
    },

    async signOut() {
        if (IS_MOCK_MODE) {
            return { error: null };
        }
        return await supabase.auth.signOut();
    },

    async getProfile(userId: string): Promise<UserProfile | null> {
        if (IS_MOCK_MODE) {
            return {
                id: userId,
                full_name: 'مستخدم تجريبي',
                avatar_url: null,
                phone: '01000000000',
                role: 'مؤجر',
                is_admin: true,
                is_verified: true
            };
        }

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('Error fetching profile:', error);
            return null;
        }
        return data as UserProfile;
    },

    // ====== رفع الصور ======
    async uploadPropertyImages(files: File[], userId: string): Promise<string[]> {
        if (IS_MOCK_MODE) {
            // Return fake cloud URLs
            return files.map(() => `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000)}?auto=format&fit=crop&w=800&q=80`);
        }

        const uploadedUrls: string[] = [];
        for (const file of files) {
            try {
                const url = await uploadImage(file, `${userId}/`);
                uploadedUrls.push(url);
            } catch (error) {
                console.error('Error uploading image:', error);
                throw error;
            }
        }
        return uploadedUrls;
    },

    // ====== حذف الصور ======
    async deletePropertyImage(url: string): Promise<void> {
        if (IS_MOCK_MODE) return;
        await deleteImage(url);
    },



    // ====== العقارات ======
    async createFullProperty(
        propertyData: PropertyInsert,
        imageFiles: File[],
        userId: string
    ): Promise<PropertyRow> {
        if (IS_MOCK_MODE) {
            const newProp: PropertyRow = {
                ...propertyData,
                id: Math.random().toString(36).substr(2, 9),
                owner_id: userId,
                images: await this.uploadPropertyImages(imageFiles, userId),
                status: 'pending',
                is_verified: false,
                views_count: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            MOCK_PROPERTIES.unshift(newProp);
            return newProp;
        }

        try {
            // 1. رفع الصور أولاً
            let imageUrls: string[] = [];
            if (imageFiles.length > 0) {
                imageUrls = await this.uploadPropertyImages(imageFiles, userId);
            }

            // 2. حفظ العقار في قاعدة البيانات
            const { data, error } = await supabase
                .from('properties')
                .insert({
                    ...propertyData,
                    owner_id: userId,
                    images: imageUrls,
                    status: 'pending',
                })
                .select()
                .single();

            if (error) {
                for (const url of imageUrls) {
                    await this.deletePropertyImage(url);
                }
                throw new Error(`فشل حفظ العقار: ${error.message}`);
            }

            return data as PropertyRow;
        } catch (error) {
            console.error('Error in createFullProperty:', error);
            throw error;
        }
    },

    async getProperties(filters?: {
        status?: string;
        category?: string;
        area?: string;
        minPrice?: number;
        maxPrice?: number;
        bedrooms?: number;
        bathrooms?: number;
        features?: string[];
        ownerId?: string;
    }): Promise<PropertyRow[]> {
        if (IS_MOCK_MODE) {
            let filtered = [...MOCK_PROPERTIES];
            if (filters?.status) filtered = filtered.filter(p => p.status === filters.status);
            if (filters?.category) filtered = filtered.filter(p => p.category === filters.category);
            if (filters?.area && filters.area !== 'الكل') filtered = filtered.filter(p => p.area === filters.area);
            if (filters?.minPrice) filtered = filtered.filter(p => p.price >= filters.minPrice!);
            if (filters?.maxPrice) filtered = filtered.filter(p => p.price <= filters.maxPrice!);
            if (filters?.bedrooms) filtered = filtered.filter(p => (p.bedrooms || 0) >= filters.bedrooms!);
            if (filters?.bathrooms) filtered = filtered.filter(p => (p.bathrooms || 0) >= filters.bathrooms!);
            if (filters?.ownerId) filtered = filtered.filter(p => p.owner_id === filters.ownerId);
            return filtered;
        }

        let query = supabase
            .from('properties')
            .select('*')
            .order('created_at', { ascending: false });

        if (filters?.status) query = query.eq('status', filters.status);
        if (filters?.category) query = query.eq('category', filters.category);
        if (filters?.area && filters.area !== 'الكل') query = query.eq('area', filters.area);
        if (filters?.minPrice) query = query.gte('price', filters.minPrice);
        if (filters?.maxPrice) query = query.lte('price', filters.maxPrice);
        if (filters?.bedrooms) query = query.gte('bedrooms', filters.bedrooms);
        if (filters?.bathrooms) query = query.gte('bathrooms', filters.bathrooms);
        if (filters?.features && filters.features.length > 0) query = query.contains('features', filters.features);
        if (filters?.ownerId) query = query.eq('owner_id', filters.ownerId);

        const { data, error } = await query;
        if (error) {
            console.error('Error fetching properties:', error);
            return [];
        }
        return (data || []) as PropertyRow[];
    },

    async getPropertyById(id: string): Promise<PropertyRow | null> {
        if (IS_MOCK_MODE) {
            return MOCK_PROPERTIES.find(p => p.id === id) || null;
        }

        const { data, error } = await supabase
            .from('properties')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching property:', error);
            return null;
        }
        return data as PropertyRow;
    },

    async incrementPropertyViews(id: string): Promise<void> {
        if (IS_MOCK_MODE) return;

        const { error } = await supabase.rpc('increment_views', { property_id: id });
        if (error) {
            const property = await this.getPropertyById(id);
            if (property) {
                await supabase
                    .from('properties')
                    .update({ views_count: property.views_count + 1 })
                    .eq('id', id);
            }
        }
    },

    async updateProperty(id: string, updates: Partial<PropertyRow>): Promise<PropertyRow | null> {
        if (IS_MOCK_MODE) {
            const idx = MOCK_PROPERTIES.findIndex(p => p.id === id);
            if (idx !== -1) {
                MOCK_PROPERTIES[idx] = { ...MOCK_PROPERTIES[idx], ...updates };
                return MOCK_PROPERTIES[idx];
            }
            return null;
        }

        const { data, error } = await supabase
            .from('properties')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating property:', error);
            return null;
        }
        return data as PropertyRow;
    },

    async deleteProperty(id: string): Promise<boolean> {
        if (IS_MOCK_MODE) {
            const idx = MOCK_PROPERTIES.findIndex(p => p.id === id);
            if (idx !== -1) {
                MOCK_PROPERTIES.splice(idx, 1);
                return true;
            }
            return false;
        }

        const property = await this.getPropertyById(id);
        if (property?.images) {
            for (const url of property.images) {
                await this.deletePropertyImage(url);
            }
        }

        const { error } = await supabase
            .from('properties')
            .delete()
            .eq('id', id);

        return !error;
    },

    // ====== المفضلة ======
    async getFavorites(userId: string): Promise<string[]> {
        if (IS_MOCK_MODE) {
            return Array.from(_mockFavorites);
        }

        const { data, error } = await supabase
            .from('favorites')
            .select('property_id')
            .eq('user_id', userId);

        if (error) {
            console.error('Error fetching favorites:', error);
            return [];
        }

        return data.map(f => f.property_id);
    },

    async toggleFavorite(userId: string, propertyId: string): Promise<boolean> {
        if (IS_MOCK_MODE) {
            if (_mockFavorites.has(propertyId)) {
                _mockFavorites.delete(propertyId);
                return false;
            } else {
                _mockFavorites.add(propertyId);
                return true;
            }
        }

        const { data: existing } = await supabase
            .from('favorites')
            .select('*')
            .eq('user_id', userId)
            .eq('property_id', propertyId)
            .single();

        if (existing) {
            await supabase
                .from('favorites')
                .delete()
                .eq('user_id', userId)
                .eq('property_id', propertyId);
            return false;
        } else {
            await supabase
                .from('favorites')
                .insert({ user_id: userId, property_id: propertyId });
            return true;
        }
    },

    // ====== العقارات المفتوحة ======
    async getUnlockedProperties(userId: string): Promise<string[]> {
        if (IS_MOCK_MODE) {
            return Array.from(_mockUnlocked);
        }

        const { data, error } = await supabase
            .from('unlocked_properties')
            .select('property_id')
            .eq('user_id', userId);

        if (error) {
            console.error('Error fetching unlocked properties:', error);
            return [];
        }

        return data.map(u => u.property_id);
    },

    async isPropertyUnlocked(userId: string, propertyId: string): Promise<boolean> {
        if (IS_MOCK_MODE) {
            return _mockUnlocked.has(propertyId);
        }

        const { data } = await supabase
            .from('unlocked_properties')
            .select('*')
            .eq('user_id', userId)
            .eq('property_id', propertyId)
            .single();

        return !!data;
    },

    async unlockProperty(userId: string, propertyId: string): Promise<void> {
        if (IS_MOCK_MODE) {
            // Mock mode: Check if payment exists in mock data
            const validPayment = _mockPayments.find((p: any) => 
                p.user_id === userId && 
                p.property_id === propertyId && 
                p.status === 'approved' && 
                !p.is_consumed &&
                p.amount >= 50
            );

            if (!validPayment) {
                throw new Error('لا يوجد دفع معتمد لهذا العقار');
            }

            // Mark payment as consumed
            validPayment.is_consumed = true;
            _mockUnlocked.add(propertyId);
            return;
        }

        try {
            // ✅ STEP 1: Verify payment exists and is approved
            const { data: payment, error: paymentError } = await supabase
                .from('payment_requests')
                .select('*')
                .eq('user_id', userId)
                .eq('property_id', propertyId)
                .eq('status', 'approved')
                .eq('is_consumed', false)
                .maybeSingle();

            if (paymentError) {
                throw new Error(`خطأ في التحقق من الدفع: ${paymentError.message}`);
            }

            if (!payment) {
                throw new Error('لا يوجد دفع معتمد لهذا العقار');
            }

            // ✅ STEP 2: Verify amount
            const UNLOCK_FEE = 50; // EGP
            if (payment.amount < UNLOCK_FEE) {
                throw new Error(
                    `المبلغ المدفوع (${payment.amount} جنيه) أقل من الرسوم المطلوبة (${UNLOCK_FEE} جنيه)`
                );
            }

            // ✅ STEP 3: Check if already unlocked
            const { data: alreadyUnlocked } = await supabase
                .from('unlocked_properties')
                .select('id')
                .eq('user_id', userId)
                .eq('property_id', propertyId)
                .maybeSingle();

            if (alreadyUnlocked) {
                throw new Error('العقار مفتوح بالفعل');
            }

            // ✅ STEP 4: Atomic operation - mark payment consumed + unlock property
            const { error: unlockError } = await supabase.rpc('unlock_property_with_payment', {
                p_user_id: userId,
                p_property_id: propertyId,
                p_payment_id: payment.id
            });

            if (unlockError) {
                throw new Error(`فشل فتح العقار: ${unlockError.message}`);
            }

        } catch (error: any) {
            console.error('Error unlocking property:', error);
            throw error;
        }
    },

    // ====== طلبات الدفع ======
    async createPaymentRequest(params: {
        userId: string;
        propertyId: string;
        amount: number;
        paymentMethod: 'vodafone_cash' | 'instapay' | 'fawry';
        receiptImage?: string;
}): Promise<void> {
        if (IS_MOCK_MODE) {
            // Store mock payment for testing
            _mockPayments.push({
                id: `mock-payment-${Date.now()}`,
                user_id: params.userId,
                property_id: params.propertyId,
                amount: params.amount,
                payment_method: params.paymentMethod,
                receipt_image: params.receiptImage,
                status: 'pending',
                is_consumed: false,
                created_at: new Date().toISOString()
            });
            return;
        }

        const { error } = await supabase
            .from('payment_requests')
            .insert({
                user_id: params.userId,
                property_id: params.propertyId,
                amount: params.amount,
                payment_method: params.paymentMethod,
                receipt_image: params.receiptImage,
            });

        if (error) {
            throw new Error(`فشل إرسال طلب الدفع: ${error.message}`);
        }
    },

    // ====== الإشعارات ======
    async getNotifications(userId: string): Promise<{
        id: string;
        title: string;
        message: string | null;
        type: string;
        is_read: boolean;
        link: string | null;
        created_at: string;
    }[]> {
        if (IS_MOCK_MODE) {
            return [
                {
                    id: 'notif-1',
                    title: 'مرحباً بك في عقارات جمصة',
                    message: 'نتمنى لك تجربة ممتعة في البحث عن عقارك المثالي.',
                    type: 'info',
                    is_read: false,
                    link: null,
                    created_at: new Date().toISOString()
                }
            ];
        }

        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching notifications:', error);
            return [];
        }
        return data || [];
    },

    async markNotificationAsRead(notificationId: string): Promise<void> {
        if (IS_MOCK_MODE) return;
        await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', notificationId);
    },

    async markAllNotificationsAsRead(userId: string): Promise<void> {
        if (IS_MOCK_MODE) return;
        await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', userId);
    },

    async createNotification(params: {
        userId: string;
        title: string;
        message: string;
        type: 'success' | 'info' | 'warning' | 'error';
        link?: string;
    }): Promise<void> {
        if (IS_MOCK_MODE) {
            return;
        }
        await supabase
            .from('notifications')
            .insert({
                user_id: params.userId,
                title: params.title,
                message: params.message,
                type: params.type,
                link: params.link,
            });
    },

    // ====== التقييمات ======
    async getReviewsForProperty(propertyId: string): Promise<{
        id: string;
        user_id: string;
        rating: number;
        comment: string | null;
        created_at: string;
    }[]> {
        if (IS_MOCK_MODE) {
            return [
                {
                    id: 'review-1',
                    user_id: 'user-2',
                    rating: 5,
                    comment: 'عقار ممتاز ونظيف جداً، والمالك متعاون.',
                    created_at: new Date().toISOString()
                }
            ];
        }

        const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .eq('property_id', propertyId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching reviews:', error);
            return [];
        }
        return data || [];
    },

    async addReview(params: {
        propertyId: string;
        userId: string;
        rating: number;
        comment?: string;
    }): Promise<void> {
        if (IS_MOCK_MODE) {
            return;
        }

        const { error } = await supabase
            .from('reviews')
            .insert({
                property_id: params.propertyId,
                user_id: params.userId,
                rating: params.rating,
                comment: params.comment,
            });

        if (error) {
            throw new Error(`فشل إضافة التقييم: ${error.message}`);
        }
    },

    // ====== إدارة المستخدمين (Admin) ======
    async getAllProfiles(): Promise<any[]> {
        if (IS_MOCK_MODE) {
            return [
                {
                    id: 'mock-user-123',
                    full_name: 'مستخدم تجريبي',
                    email: 'test@example.com',
                    role: 'مؤجر',
                    is_verified: true,
                    created_at: new Date().toISOString()
                }
            ];
        }

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching profiles:', error);
            return [];
        }
        return data;
    },

    async updateUserProfile(userId: string, updates: any) {
        if (IS_MOCK_MODE) return { ...updates, id: userId };

        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId)
            .select()
            .single();

        if (error) {
            throw new Error(`فشل تحديث الملف الشخصي: ${error.message}`);
        }
        return data;
    },

    // ====== نظام المحادثة (Messaging) ======
    async createConversation(params: {
        propertyId: string;
        buyerId: string;
        ownerId: string;
    }): Promise<string> {
        if (IS_MOCK_MODE) return 'mock-conv-1';

        const { data: existing } = await supabase
            .from('conversations')
            .select('id')
            .eq('property_id', params.propertyId)
            .eq('buyer_id', params.buyerId)
            .eq('owner_id', params.ownerId)
            .single();

        if (existing) return existing.id;

        const { data, error } = await supabase
            .from('conversations')
            .insert({
                property_id: params.propertyId,
                buyer_id: params.buyerId,
                owner_id: params.ownerId,
            })
            .select('id')
            .single();

        if (error) throw new Error(`فشل بدء المحادثة: ${error.message}`);
        return data.id;
    },

    async getUserConversations(userId: string) {
        if (IS_MOCK_MODE) {
            return [
                {
                    id: 'mock-conv-1',
                    property_id: '1',
                    buyer_id: userId,
                    owner_id: 'owner-1',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    property: MOCK_PROPERTIES[0],
                    buyer: { full_name: 'مستخدم تجريبي', avatar_url: null },
                    owner: { full_name: 'الحاج محمد', avatar_url: null },
                    last_message: { text: 'هل العقار لا يزال متاحاً؟', created_at: new Date().toISOString(), is_read: false, sender_id: userId }
                }
            ];
        }

        // Use parameterized filters to prevent injection (no string interpolation in .or())
        const { data: asBuyer, error: errBuyer } = await supabase
            .from('conversations')
            .select(`
                *,
                property:properties(title, images),
                buyer:profiles!buyer_id(full_name, avatar_url),
                owner:profiles!owner_id(full_name, avatar_url),
                last_message:messages(text, created_at, is_read, sender_id)
            `)
            .eq('buyer_id', userId)
            .order('updated_at', { ascending: false });

        const { data: asOwner, error: errOwner } = await supabase
            .from('conversations')
            .select(`
                *,
                property:properties(title, images),
                buyer:profiles!buyer_id(full_name, avatar_url),
                owner:profiles!owner_id(full_name, avatar_url),
                last_message:messages(text, created_at, is_read, sender_id)
            `)
            .eq('owner_id', userId)
            .order('updated_at', { ascending: false });

        const error = errBuyer || errOwner;
        const data = [...(asBuyer || []), ...(asOwner || [])]
            .sort((a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

        if (error) {
            console.error('Error fetching conversations:', error);
            return [];
        }

        return data.map((conv: any) => ({
            ...conv,
            last_message: conv.last_message?.[0] || null
        }));
    },

    async getMessages(conversationId: string, limit: number = 50, offset: number = 0) {
        if (IS_MOCK_MODE) {
            return [
                {
                    id: 'msg-1',
                    conversation_id: conversationId,
                    sender_id: 'mock-user-123',
                    text: 'السلام عليكم، هل الشقة متاحة؟',
                    created_at: new Date(Date.now() - 100000).toISOString(),
                    is_read: true,
                    message_type: 'text'
                },
                {
                    id: 'msg-2',
                    conversation_id: conversationId,
                    sender_id: 'owner-1',
                    text: 'وعليكم السلام، نعم متاحة يا فندم.',
                    created_at: new Date(Date.now() - 50000).toISOString(),
                    is_read: false,
                    message_type: 'text'
                }
            ];
        }

        const { data, error } = await supabase
            .from('messages')
            .select('*, sender:profiles(full_name, avatar_url)')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            console.error('Error fetching messages:', error);
            return [];
        }
        return (data || []).reverse(); // Return in chronological order
    },

    async sendMessage(params: {
        conversationId: string;
        senderId: string;
        text?: string;
        messageType?: 'text' | 'voice' | 'image' | 'system';
        mediaUrl?: string;
        duration?: number;
        metadata?: any;
    }) {
        if (IS_MOCK_MODE) {
            return;
        }

        const { error } = await supabase
            .from('messages')
            .insert({
                conversation_id: params.conversationId,
                sender_id: params.senderId,
                text: params.text,
                message_type: params.messageType || 'text',
                media_url: params.mediaUrl,
                duration: params.duration,
                metadata: params.metadata
            });

        if (error) throw new Error(`فشل إرسال الرسالة: ${error.message}`);

        await supabase
            .from('conversations')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', params.conversationId);
    },

    async markMessagesAsRead(conversationId: string, userId: string) {
        if (IS_MOCK_MODE) return;

        await supabase
            .from('messages')
            .update({ is_read: true })
            .eq('conversation_id', conversationId)
            .neq('sender_id', userId)
            .eq('is_read', false);
    },

    // ====== Voice Notes & Media ======
    async uploadVoiceNote(audioBlob: Blob, conversationId: string): Promise<string> {
        if (IS_MOCK_MODE) {
            return 'https://example.com/mock-voice.mp3';
        }

        const filename = `${conversationId}_${Date.now()}.webm`;
        const { data, error } = await supabase.storage
            .from('voice-notes')
            .upload(filename, audioBlob, { contentType: 'audio/webm' });

        if (error) throw new Error(`فشل رفع الرسالة الصوتية: ${error.message}`);

        const { data: { publicUrl } } = supabase.storage
            .from('voice-notes')
            .getPublicUrl(filename);

        return publicUrl;
    },

    async uploadChatImage(imageFile: File, conversationId: string): Promise<string> {
        if (IS_MOCK_MODE) {
            return 'https://example.com/mock-image.jpg';
        }

        const fileExt = imageFile.name.split('.').pop();
        const filename = `${conversationId}_${Date.now()}.${fileExt}`;
        const { data, error } = await supabase.storage
            .from('chat-images')
            .upload(filename, imageFile);

        if (error) throw new Error(`فشل رفع الصورة: ${error.message}`);

        const { data: { publicUrl } } = supabase.storage
            .from('chat-images')
            .getPublicUrl(filename);

        return publicUrl;
    },

    // ====== Media Permissions ======
    async requestMediaPermission(conversationId: string, userId: string): Promise<void> {
        if (IS_MOCK_MODE) {
            return;
        }

        await supabase
            .from('conversations')
            .update({ media_permission_status: 'requested' })
            .eq('id', conversationId);

        // Send system message
        await this.sendMessage({
            conversationId,
            senderId: userId,
            text: '', // Will be handled by message_type
            messageType: 'system',
            metadata: { type: 'media_permission_request' }
        });
    },

    async grantMediaPermission(conversationId: string): Promise<void> {
        if (IS_MOCK_MODE) return;

        await supabase
            .from('conversations')
            .update({ media_permission_status: 'granted' })
            .eq('id', conversationId);
    },

    async denyMediaPermission(conversationId: string): Promise<void> {
        if (IS_MOCK_MODE) return;

        await supabase
            .from('conversations')
            .update({ media_permission_status: 'denied' })
            .eq('id', conversationId);
    },

    async getConversationDetails(conversationId: string): Promise<any> {
        if (IS_MOCK_MODE) {
            return {
                id: conversationId,
                property_id: '1',
                tenant_id: 'mock-user-123',
                owner_id: 'owner-1',
                media_permission_status: 'none',
                property: MOCK_PROPERTIES[0]
            };
        }

        const { data, error } = await supabase
            .from('conversations')
            .select(`
                *,
                property:properties(*)
            `)
            .eq('id', conversationId)
            .single();

        if (error) {
            console.error('Error fetching conversation details:', error);
            return null;
        }

        return data;
    },

    // ====== Real-time Presence & Typing ======
    async updateOnlineStatus(userId: string, status: boolean) {
        if (IS_MOCK_MODE) return;

        const { error } = await supabase
            .from('profiles')
            .update({
                online_status: status,
                last_seen: new Date().toISOString()
            })
            .eq('id', userId);

        if (error) console.error('Error updating online status:', error);
    },

    async sendTypingIndicator(conversationId: string, isTyping: boolean) {
        const channel = supabase.channel(`typing-${conversationId}`);
        await channel.send({
            type: 'broadcast',
            event: 'typing',
            payload: { isTyping }
        });
    },

    subscribeToTypingIndicator(conversationId: string, callback: (isTyping: boolean) => void) {
        const channel = supabase.channel(`typing-${conversationId}`)
            .on(
                'broadcast',
                { event: 'typing' },
                (payload) => callback(payload.payload.isTyping)
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    },

    async uploadMedia(file: File, type: 'image' | 'voice', conversationId: string): Promise<string> {
        if (type === 'image') {
            return this.uploadChatImage(file, conversationId);
        } else {
            // Assuming voice files are Blobs or Files
            return this.uploadVoiceNote(file, conversationId);
        }
    },

    // ====== نظام الحجز المتقدم ======

    /**
     * حساب السعر الإجمالي للحجز
     */
    calculateTotalPrice(
        rentalConfig: import('@/types').RentalConfig,
        startDate: Date,
        endDate: Date
    ): {
        basePrice: number;
        serviceFee: number;
        depositAmount: number;
        totalAmount: number;
        duration: number;
    } {
        const { type, pricePerUnit, seasonalConfig } = rentalConfig;
        let duration = 0;
        let basePrice = 0;
        let depositAmount = 0;

        switch (type) {
            case 'daily':
                // حساب عدد الليالي
                duration = Math.ceil(
                    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
                );
                basePrice = duration * pricePerUnit;
                break;

            case 'monthly':
                // حساب عدد الأشهر (تقريبي: 30 يوم = شهر)
                const days = Math.ceil(
                    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
                );
                duration = Math.ceil(days / 30);
                basePrice = duration * pricePerUnit;
                break;

            case 'seasonal':
                // الفترة الدراسية ثابتة: 10 أشهر
                duration = 10;
                basePrice = duration * pricePerUnit;

                // التأمين إذا كان مطلوباً
                if (seasonalConfig?.requiresDeposit) {
                    depositAmount = seasonalConfig.depositAmount || pricePerUnit;
                }
                break;
        }

        const SERVICE_FEE_PERCENTAGE = 0.1; // 10%
        const serviceFee = basePrice * SERVICE_FEE_PERCENTAGE;
        const totalAmount = basePrice + serviceFee + depositAmount;

        return {
            basePrice,
            serviceFee,
            depositAmount,
            totalAmount,
            duration,
        };
    },

    /**
     * التحقق من توفر العقار في الفترة المطلوبة
     */
    async checkAvailability(
        propertyId: string,
        startDate: string,
        endDate: string
    ): Promise<{ available: boolean; error: any }> {
        if (IS_MOCK_MODE) {
            // في وضع Mock، نفترض أن العقار متاح دائماً
            return { available: true, error: null };
        }

        // Defensive validation
        const { validateDateString, validateUUID } = await import('@/utils/validation');
        
        if (!validateUUID(propertyId)) {
            return { available: false, error: { message: 'معرف العقار غير صالح' } };
        }
        
        if (!validateDateString(startDate) || !validateDateString(endDate)) {
            return { available: false, error: { message: 'تاريخ غير صالح' } };
        }

        const { data, error } = await supabase
            .from('bookings')
            .select('id')
            .eq('property_id', propertyId)
            .in('status', ['confirmed', 'pending'])
            .gte('end_date', startDate)
            .lte('start_date', endDate);

        return {
            available: !data || data.length === 0,
            error
        };
    },

    /**
     * إنشاء حجز جديد
     */
    async createBooking(bookingData: Omit<import('@/types').Booking, 'id' | 'createdAt'>): Promise<{
        data: import('@/types').Booking | null;
        error: any;
    }> {
if (IS_MOCK_MODE) {
            // Mock mode: Basic conflict check
            const existingBookings: any[] = []; // In real implementation, check against existing bookings
            const hasConflict = existingBookings.some((b: any) => 
                b.property_id === bookingData.propertyId &&
                b.status === 'confirmed' &&
                !((bookingData.endDate < b.start_date) || (bookingData.startDate > b.end_date))
            );

            if (hasConflict) {
                return { data: null, error: { message: 'التواريخ المطلوبة محجوزة بالفعل' } };
            }

            const mockBooking: import('@/types').Booking = {
                ...bookingData,
                id: `BK-${Date.now()}`,
                createdAt: new Date().toISOString(),
            };
            return { data: mockBooking, error: null };
        }

        // Use atomic booking function to prevent double bookings
        const { data, error } = await supabase.rpc('create_atomic_booking', {
            p_property_id: bookingData.propertyId,
            p_user_id: bookingData.userId,
            p_start_date: bookingData.startDate,
            p_end_date: bookingData.endDate,
            p_total_nights: bookingData.totalNights,
            p_total_months: bookingData.totalMonths,
            p_rental_type: bookingData.rentalType,
            p_tenant_name: bookingData.tenantName,
            p_tenant_phone: bookingData.tenantPhone,
            p_tenant_email: bookingData.tenantEmail,
            p_base_price: bookingData.basePrice,
            p_service_fee: bookingData.serviceFee,
            p_deposit_amount: bookingData.depositAmount,
            p_total_amount: bookingData.totalAmount,
            p_payment_method: bookingData.paymentMethod,
            p_payment_status: bookingData.paymentStatus,
            p_payment_proof: bookingData.paymentProof,
        });

        if (error) {
            return { data: null, error };
        }

// Fetch the complete booking data
        const { data: fullBooking, error: fetchError } = await supabase
            .from('bookings')
            .select('*')
            .eq('id', data)
            .single();

        if (fetchError) {
            return { data: null, error: fetchError };
        }

// تحويل أسماء الأعمدة من snake_case إلى camelCase
        const booking: import('@/types').Booking = {
            id: fullBooking.id,
            propertyId: fullBooking.property_id,
            userId: fullBooking.user_id,
            startDate: fullBooking.start_date,
            endDate: fullBooking.end_date,
            totalNights: fullBooking.total_nights,
            totalMonths: fullBooking.total_months,
            rentalType: fullBooking.rental_type,
            tenantName: fullBooking.tenant_name,
            tenantPhone: fullBooking.tenant_phone,
            tenantEmail: fullBooking.tenant_email,
            basePrice: fullBooking.base_price,
            serviceFee: fullBooking.service_fee,
            depositAmount: fullBooking.deposit_amount,
            totalAmount: fullBooking.total_amount,
            paymentMethod: fullBooking.payment_method,
            paymentStatus: fullBooking.payment_status,
            paymentProof: fullBooking.payment_proof,
            status: fullBooking.status,
            createdAt: fullBooking.created_at,
confirmedAt: fullBooking.confirmed_at,
        };

        return { data: booking, error: null };
    },

    /**
     * جلب حجوزات المستخدم
     */
    async getUserBookings(userId: string): Promise<{
        data: import('@/types').Booking[];
        error: any;
    }> {
        if (IS_MOCK_MODE) {
            return { data: [], error: null };
        }

        const { data, error } = await supabase
            .from('bookings')
            .select(`
                *,
                property:properties(title, images, location, address)
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            return { data: [], error };
        }

        // تحويل البيانات
        const bookings: import('@/types').Booking[] = (data || []).map((item: any) => ({
            id: item.id,
            propertyId: item.property_id,
            userId: item.user_id,
            startDate: item.start_date,
            endDate: item.end_date,
            totalNights: item.total_nights,
            totalMonths: item.total_months,
            rentalType: item.rental_type,
            tenantName: item.tenant_name,
            tenantPhone: item.tenant_phone,
            tenantEmail: item.tenant_email,
            basePrice: item.base_price,
            serviceFee: item.service_fee,
            depositAmount: item.deposit_amount,
            totalAmount: item.total_amount,
            paymentMethod: item.payment_method,
            paymentStatus: item.payment_status,
            paymentProof: item.payment_proof,
            status: item.status,
            createdAt: item.created_at,
            confirmedAt: item.confirmed_at,
            property: item.property,
        }));

        return { data: bookings, error: null };
    },

    /**
     * رفع إيصال الدفع
     */
    async uploadPaymentReceipt(
        bookingId: string,
        receiptFile: File
    ): Promise<{ url: string | null; error: any }> {
        if (IS_MOCK_MODE) {
            return {
                url: 'https://example.com/receipt.jpg',
                error: null
            };
        }

        const fileExt = receiptFile.name.split('.').pop();
        const fileName = `${bookingId}_${Date.now()}.${fileExt}`;

        const { data, error } = await supabase.storage
            .from('payment-receipts')
            .upload(fileName, receiptFile);

        if (error) return { url: null, error };

        const { data: { publicUrl } } = supabase.storage
            .from('payment-receipts')
            .getPublicUrl(fileName);

        // تحديث الحجز بالإيصال
        await supabase
            .from('bookings')
            .update({ payment_proof: publicUrl })
            .eq('id', bookingId);

        return { url: publicUrl, error: null };
    },

    /**
     * جلب تفاصيل حجز محدد
     */
    async getBookingById(bookingId: string): Promise<{
        data: import('@/types').Booking | null;
        error: any;
    }> {
        if (IS_MOCK_MODE) {
            return { data: null, error: null };
        }

        const { data, error } = await supabase
            .from('bookings')
            .select(`
                *,
                property:properties(*),
                user:profiles(full_name, phone, email)
            `)
            .eq('id', bookingId)
            .single();

        if (error) {
            return { data: null, error };
        }

        const booking: import('@/types').Booking = {
            id: data.id,
            propertyId: data.property_id,
            userId: data.user_id,
            startDate: data.start_date,
            endDate: data.end_date,
            totalNights: data.total_nights,
            totalMonths: data.total_months,
            rentalType: data.rental_type,
            tenantName: data.tenant_name,
            tenantPhone: data.tenant_phone,
            tenantEmail: data.tenant_email,
            basePrice: data.base_price,
            serviceFee: data.service_fee,
            depositAmount: data.deposit_amount,
            totalAmount: data.total_amount,
            paymentMethod: data.payment_method,
            paymentStatus: data.payment_status,
            paymentProof: data.payment_proof,
            status: data.status,
            createdAt: data.created_at,
            confirmedAt: data.confirmed_at,
            property: data.property,
            user: data.user,
        };

        return { data: booking, error: null };
    },

    /**
     * تحديث حالة الحجز
     */
    async updateBookingStatus(
        bookingId: string,
        status: 'pending' | 'confirmed' | 'cancelled',
        paymentStatus?: 'pending' | 'confirmed' | 'failed'
    ): Promise<{ error: any }> {
        if (IS_MOCK_MODE) {
            return { error: null };
        }

        const updates: any = { status };
        if (paymentStatus) {
            updates.payment_status = paymentStatus;
        }
        if (status === 'confirmed') {
            updates.confirmed_at = new Date().toISOString();
        }

        const { error } = await supabase
            .from('bookings')
            .update(updates)
            .eq('id', bookingId);

        return { error };
    }
};

