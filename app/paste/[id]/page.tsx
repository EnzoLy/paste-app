import { Suspense } from 'react';
import { PastePageClient } from './paste-page-client';
import { Loader2 } from 'lucide-react';

export default function PastePage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground mt-4">Loading paste...</p>
        </main>
      }
    >
      <PastePageClient />
    </Suspense>
  );
}
