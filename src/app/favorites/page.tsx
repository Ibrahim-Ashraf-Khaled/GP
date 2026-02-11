import { Metadata } from 'next';
import FavoritesClient from './FavoritesClient';

export const metadata: Metadata = {
    title: 'المفضلة - عقاراتك المفضلة في جمصة',
    description: 'تصفح قائمتك المفضلة من العقارات في جمصة. حفظ عقاراتك المفضلة للوصول السريع.',
    keywords: ['المفضلة', 'عقارات مفضلة', 'جمصة', 'قائمة الرغبات'],
};

export default function FavoritesPage() {
    return <FavoritesClient />;
}