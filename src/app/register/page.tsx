import { redirect } from 'next/navigation';

type RegisterPageProps = {
    searchParams: Promise<{ redirect?: string }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
    const sp = await searchParams;
    const redirectParam = typeof sp.redirect === 'string' && sp.redirect
        ? `&redirect=${encodeURIComponent(sp.redirect)}`
        : '';

    redirect(`/auth?mode=signup${redirectParam}`);
}
