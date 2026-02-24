import { redirect } from 'next/navigation';

export default function LoginPage({ searchParams }: { searchParams: { redirect?: string } }) {
    const redirectParam = searchParams.redirect ? `&redirect=${searchParams.redirect}` : '';
    redirect(`/auth?mode=login${redirectParam}`);
}
