'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { PasteViewer } from '@/components/paste/paste-viewer';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle } from 'lucide-react';
import { getPaste, type PasteData } from '@/lib/actions/paste-actions';
import { importKey, decryptContent, splitEncryptedData } from '@/lib/crypto';
import { Navbar } from '@/components/navbar';

export function PastePageClient() {
  const params = useParams();
  const id = params.id as string;

  const [paste, setPaste] = useState<PasteData | null>(null);
  const [decryptedContent, setDecryptedContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAndDecrypt() {
      try {
        setLoading(true);
        setError(null);

        const fragment = window.location.hash.slice(1);
        if (!fragment) {
          throw new Error('Encryption key is missing from URL');
        }

        const result = await getPaste(id);

        if (!result.success) {
          if (result.notFound) {
            throw new Error('Paste not found');
          }
          if (result.expired) {
            throw new Error('This paste has expired');
          }
          throw new Error(result.error || 'Failed to load paste');
        }

        setPaste(result.paste!);

        const { encrypted, iv } = splitEncryptedData(result.paste!.encrypted_content);

        const key = await importKey(fragment);

        const content = await decryptContent(encrypted, iv, key);
        setDecryptedContent(content);
      } catch (err) {
        console.error('Error loading paste:', err);
        setError(err instanceof Error ? err.message : 'Failed to load paste');
      } finally {
        setLoading(false);
      }
    }

    loadAndDecrypt();
  }, [id]);

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 flex flex-col">
        {loading && (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Decrypting paste...</p>
          </div>
        )}

        {error && (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4">
            <div className="rounded-full bg-red-100 dark:bg-red-950/30 p-4">
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-500" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold">Error Loading Paste</h2>
              <p className="text-muted-foreground">{error}</p>
            </div>
            <Button asChild>
              <Link href="/">Create New Paste</Link>
            </Button>
          </div>
        )}

        {!loading && !error && paste && decryptedContent && (
          <PasteViewer
            content={decryptedContent}
            language={paste.language}
            createdAt={paste.created_at}
            expiresAt={paste.expires_at}
          />
        )}
      </div>
    </main>
  );
}
