import { beforeAll, afterAll, vi } from 'vitest'
import { installSupabaseFetchMock, uninstallSupabaseFetchMock, resetSupabaseMockDb } from './supabaseFetchMock'

// Mock the environment variables needed for Supabase client
vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'http://localhost:54321')
vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test_anon_key')

if (process.env.VITEST_SUPABASE_MOCK === '1') {
    installSupabaseFetchMock()
}

beforeAll(() => {
    // شغّله فقط لو متغير البيئة مفعّل
    if (process.env.VITEST_SUPABASE_MOCK === '1') {
        resetSupabaseMockDb()
    }
})

afterAll(() => {
    if (process.env.VITEST_SUPABASE_MOCK === '1') {
        uninstallSupabaseFetchMock()
        vi.unstubAllEnvs()
    }
})
