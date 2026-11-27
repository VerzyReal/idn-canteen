'use client';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export function LoadingSpinner({ size = 'md', color = 'text-primary-500' }: LoadingSpinnerProps) {
  const sizeMap = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <svg
      className={`animate-spin ${sizeMap[size]} ${color}`}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export function PageLoading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-orange-50">
      <div className="text-5xl mb-4 animate-pulse">🍽️</div>
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-gray-400 text-sm">Memuat...</p>
    </div>
  );
}

