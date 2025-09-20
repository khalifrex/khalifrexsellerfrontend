// app/await-verification/page.js (or pages/await-verification.js for Pages Router)
'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AwaitVerification from '@/components/become-sellerComponents/AwaitVerification';

function AwaitVerificationContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type') || 'free';
  const amount = searchParams.get('amount');

  return <AwaitVerification subscriptionType={type} paymentAmount={amount} />;
}

export default function AwaitVerificationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <AwaitVerificationContent />
    </Suspense>
  );
}