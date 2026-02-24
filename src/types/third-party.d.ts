// Type declarations for packages that don't ship proper types or which
// TypeScript isn't resolving correctly.  Adding these keeps the compiler
// from complaining about missing modules while still allowing us to import
// the real runtime code.

// @supabase/ssr currently doesn't expose its types via the `types`/`typings` field
// in package.json, so the compiler treats the package as untyped.  We declare
// it here as `any` to satisfy the compiler; you can replace `any` with more
// precise declarations if you need better type-checking.
declare module '@supabase/ssr' {
  import type { SupabaseClient, SupabaseClientOptions } from '@supabase/supabase-js';

  // minimal re-exports that we actually use; feel free to expand if necessary
  export function createServerClient<Database = any, SchemaName extends string = 'public'>(
    url: string,
    key: string,
    options?: { cookies?: any } & SupabaseClientOptions<Database, SchemaName>
  ): SupabaseClient<Database, SchemaName>;

  export function createBrowserClient<Database = any, SchemaName extends string = 'public'>(
    url: string,
    key: string,
    options?: SupabaseClientOptions<Database, SchemaName>
  ): SupabaseClient<Database, SchemaName>;

  export type CookieOptions = any;
}

// some Next.js internals used by server components/route handlers.  There
// are already type definitions in `next`, but the compiler has trouble
// resolving them from 'next/headers' in certain tsconfig configurations,
// particularly when using `moduleResolution: "bundler"`.  A simple ambient
// declaration here keeps the build happy; at runtime the real implementations
// will be imported from Next.
//
// Additionally, when the editor creates temporary files (e.g. during
// diagnostics) the paths aliased with "@/" may not be recognized.  To help
// the language server resolve those imports we include a generic wildcard
// declaration for our own src alias as well.  This doesn't affect the
// compiler but silences errors in ephemeral files.

declare module '@/*';

declare module 'next/headers' {
  export function cookies(): RequestCookies;
  export function headers(): Headers;

  interface RequestCookies {
    get(name: string): { value: string } | undefined;
    set(name: string, value: string, options?: any): void;
  }
}
