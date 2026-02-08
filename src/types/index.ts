// أنواع البيانات الأساسية للمنصة (English values for schema/API; use CATEGORY_AR, STATUS_AR for UI)

import type { PropertyCategory, PropertyStatus, PriceUnit } from './database.types';

export type { PropertyCategory, PropertyStatus, PriceUnit } from './database.types';
export { CATEGORY_AR, PRICE_UNIT_AR, STATUS_AR } from './database.types';

export type UserRole = 'مؤجر' | 'مستأجر' | 'admin';
export type PaymentStatus = 'pending' | 'approved' | 'rejected';

// Role Constants
export const ROLE_LANDLORD: UserRole = 'مؤجر';
export const ROLE_TENANT: UserRole = 'مستأجر';
export const ROLE_ADMIN: UserRole = 'admin';

// Role Helper Functions
export const isLandlord = (role: UserRole | undefined): boolean => role === ROLE_LANDLORD;
export const isTenant = (role: UserRole | undefined): boolean => role === ROLE_TENANT;
export const isAdmin = (role: UserRole | undefined): boolean => role === ROLE_ADMIN;

export interface Location {
    lat: number;
    lng: number;
    address: string;
    area: string; // مثل: الكرنك، البحر، المركز
}

export interface Property {
    id: string;
    title: string;
    description: string;
    price: number;
    priceUnit: PriceUnit;
    category: PropertyCategory;
    status: PropertyStatus;
    images: string[];
    location: Location;
    ownerPhone: string; // مخفي حتى الدفع
    ownerId: string;
    ownerName: string;
    features: string[]; // مثل: تكييف، واي فاي، قريب من البحر
    bedrooms: number;
    bathrooms: number;
    area: number; // المساحة بالمتر المربع
    floor: number;
    isVerified: boolean; // تم معاينته من الإدارة
    viewsCount: number;
    createdAt: string;
    updatedAt: string;

    // نظام الحجز الجديد
    rentalConfig?: RentalConfig; // تكوين الإيجار (اختياري للتوافق مع البيانات القديمة)
    availableDates?: {
        start: string;
        end: string;
    }[]; // الفتر ات المتاحة للحجز
}

export interface User {
    id: string;
    name: string;
    phone: string;
    email?: string;
    avatar?: string;
    role: UserRole;
    nationalId?: string; // للتوثيق
    isVerified: boolean;
    favorites: string[]; // معرفات العقارات المفضلة
    unlockedProperties: string[]; // العقارات المدفوع عليها
    createdAt: string;
    lastLogin?: string; // آخر تسجيل دخول
    memberSince: string; // تاريخ الانضمام
}

export interface PaymentRequest {
    id: string;
    userId: string;
    userName: string;
    userPhone: string;
    propertyId: string;
    propertyTitle: string;
    amount: number;
    paymentMethod: 'vodafone_cash' | 'instapay' | 'fawry';
    receiptImage: string; // رابط صورة الإيصال
    status: PaymentStatus;
    adminNote?: string;
    createdAt: string;
    processedAt?: string;
}

export interface Review {
    id: string;
    propertyId: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    rating: number; // 1-5
    comment: string;
    createdAt: string;
}

export interface Contract {
    id: string;
    propertyId: string;
    ownerId: string;
    tenantId: string;
    startDate: string;
    endDate: string;
    totalAmount: number;
    ownerSignature?: string; // Base64
    tenantSignature?: string; // Base64
    status: 'draft' | 'signed' | 'completed';
    createdAt: string;
}

export interface Notification {
    id: string;
    userId: string;
    title: string;
    message: string;
    type: 'success' | 'info' | 'warning' | 'error';
    isRead: boolean;
    createdAt: string;
    link?: string; // رابط للانتقال عند الضغط
}

export interface SearchFilters {
    query?: string;
    category?: PropertyCategory;
    minPrice?: number;
    maxPrice?: number;
    area?: string;
    bedrooms?: number;
    features?: string[];
    onlyVerified?: boolean;
}

// الثوابت
export const AREAS = [
    'منطقة الكرنك',
    'منطقة البحر',
    'المركز',
    'الشاطئ الجديد',
    'منطقة السوق',
    'الحي الغربي',
    'الحي الشرقي',
];

export const FEATURES = [
    'تكييف',
    'واي فاي',
    'قريب من البحر',
    'موقف سيارة',
    'مطبخ مجهز',
    'شرفة',
    'إطلالة بحرية',
    'أثاث كامل',
    'غسالة',
    'تلفزيون',
    'سخان مياه',
    'مصعد',
];

export const COMMISSION_AMOUNT = 50; // قيمة السمسرة بالجنيه
export const SERVICE_FEE_PERCENTAGE = 0.1; // 10% رسوم خدمة

export const VODAFONE_CASH_NUMBER = '01xxxxxxxxx'; // سيتم تحديده

export const GAMASA_CENTER = {
    lat: 31.4431,
    lng: 31.5344,
};

export const GAMASA_BOUNDS = {
    north: 31.47,
    south: 31.41,
    east: 31.58,
    west: 31.49,
};

// ====== نظام الحجز المتقدم ======

// أنواع الإيجار
export type RentalType = 'daily' | 'monthly' | 'seasonal';

// تكوين الإيجار
export interface RentalConfig {
    type: RentalType;
    pricePerUnit: number; // السعر لكل وحدة (يوم/شهر)
    minDuration: number;  // الحد الأدنى للإيجار
    maxDuration: number;  // الحد الأقصى للإيجار

    // خاص بالإيجار الموسمي
    seasonalConfig?: {
        startMonth: number;      // شهر البداية (افتراضي: 9 سبتمبر)
        endMonth: number;        // شهر النهاية (افتراضي: 6 يونيو)
        requiresDeposit: boolean; // هل يتطلب تأمين
        depositAmount?: number;   // قيمة التأمين (افتراضي: سعر شهر واحد)
    };
}

// الحجز
export interface Booking {
    id: string;
    propertyId: string;
    userId: string;

    // بيانات الحجز
    startDate: string;
    endDate: string;
    totalNights?: number;  // للإيجار اليومي
    totalMonths?: number;  // للإيجار الشهري/الموسمي
    rentalType: RentalType;

    // بيانات المستأجر (تُملأ من ملف المستخدم)
    tenantName: string;
    tenantPhone: string;
    tenantEmail?: string;

    // التكاليف
    basePrice: number;      // السعر الأساسي
    serviceFee: number;     // رسوم الخدمة (10%)
    depositAmount?: number; // التأمين (للموسمي)
    totalAmount: number;    // المجموع الكلي

    // الدفع
    paymentMethod: 'vodafone_cash' | 'instapay' | 'cash_on_delivery';
    paymentStatus: 'pending' | 'confirmed' | 'failed';
    paymentProof?: string;  // رابط صورة الإيصال

    // الحالة
    status: 'pending' | 'confirmed' | 'cancelled';
    createdAt: string;
    confirmedAt?: string;

    // العلاقات (للعرض)
    property?: Property;
    user?: User;
}
