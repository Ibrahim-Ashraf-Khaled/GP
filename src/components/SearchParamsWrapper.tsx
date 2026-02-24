'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

interface SearchParamsWrapperProps {
  children: React.ReactNode;
}

export default function SearchParamsWrapper({ children }: SearchParamsWrapperProps) {
  useSearchParams();
  return <>{children}</>;
}

export function withSearchParams<P extends object>(
  Component: React.ComponentType<P>
) {
  return function WithSearchParams(props: P) {
    return (
      <Suspense fallback={null}>
        <SearchParamsWrapper>
          <Component {...props} />
        </SearchParamsWrapper>
      </Suspense>
    );
  };
}
