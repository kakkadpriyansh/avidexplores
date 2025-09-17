import { Suspense } from 'react';
import BookingConfirmation from '@/components/BookingConfirmation';

interface PageProps {
  params: {
    bookingId: string;
  };
}

function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
    </div>
  );
}

export default function BookingConfirmationPage({ params }: PageProps) {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <BookingConfirmation bookingId={params.bookingId} />
    </Suspense>
  );
}

export async function generateMetadata({ params }: PageProps) {
  return {
    title: `Booking Confirmation - ${params.bookingId} | Avid Explores`,
    description: 'Your adventure booking has been confirmed. View your booking details and prepare for your journey.',
  };
}