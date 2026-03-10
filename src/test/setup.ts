import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

// Mock next/navigation
vi.mock('next/navigation', () => ({
    useRouter: () => ({ replace: vi.fn(), push: vi.fn(), refresh: vi.fn(), back: vi.fn() }),
    useSearchParams: () => new URLSearchParams(),
    usePathname: () => '',
}))

// Mock Supabase Env Vars
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test_anon_key'
