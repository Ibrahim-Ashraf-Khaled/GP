import { redirect } from 'next/navigation';

export default function RegisterPage({ searchParams }: { searchParams: { redirect?: string } }) {
    const redirectParam = searchParams.redirect ? `&redirect=${searchParams.redirect}` : '';
    redirect(`/auth?mode=signup${redirectParam}`);
}
