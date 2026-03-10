import { redirect } from 'next/navigation';

type LoginPageProps = {
    searchParams: Promise<{ redirect?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
    const sp = await searchParams;
    const redirectParam = typeof sp.redirect === 'string' && sp.redirect
        ? `&redirect=${encodeURIComponent(sp.redirect)}`
        : '';

    redirect(`/auth?mode=login${redirectParam}`);
}
