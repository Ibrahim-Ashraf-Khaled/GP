import L from 'leaflet';

let defaultIconConfigured = false;

export function ensureLeafletDefaultIcon() {
    if (defaultIconConfigured || typeof window === 'undefined') {
        return;
    }

    delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: '/leaflet/marker-icon-2x.png',
        iconUrl: '/leaflet/marker-icon.png',
        shadowUrl: '/leaflet/marker-shadow.png',
    });

    defaultIconConfigured = true;
}

ensureLeafletDefaultIcon();
