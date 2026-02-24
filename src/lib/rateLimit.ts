import { NextRequest } from 'next/server';

interface RateLimitConfig {
    interval: number;
    uniqueTokenPerInterval: number;
}

const cache = new Map<string, number[]>();

export async function rateLimit(
    request: NextRequest,
    config: RateLimitConfig = {
        interval: 60 * 1000,
        uniqueTokenPerInterval: 10
    }
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
    const token = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
        || request.headers.get('x-real-ip') 
        || 'unknown';
    
    const now = Date.now();
    const windowStart = now - config.interval;
    
    const requests = cache.get(token) || [];
    const recentRequests = requests.filter(time => time > windowStart);
    
    recentRequests.push(now);
    cache.set(token, recentRequests);
    
    const success = recentRequests.length <= config.uniqueTokenPerInterval;
    
    return {
        success,
        limit: config.uniqueTokenPerInterval,
        remaining: Math.max(0, config.uniqueTokenPerInterval - recentRequests.length),
        reset: windowStart + config.interval
    };
}

setInterval(() => {
    const now = Date.now();
    for (const [token, requests] of cache.entries()) {
        const recentRequests = requests.filter(time => time > now - 60 * 60 * 1000);
        if (recentRequests.length === 0) {
            cache.delete(token);
        } else {
            cache.set(token, recentRequests);
        }
    }
}, 10 * 60 * 1000);
