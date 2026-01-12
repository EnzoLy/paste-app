'use client';

import { useState, useEffect, useCallback } from 'react';
import { ExpirationSelector } from './expiration-selector';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileText } from 'lucide-react';
import { type LanguageValue, SUPPORTED_LANGUAGES } from '@/lib/languages';
import { type ExpirationOption, calculateExpirationDate } from '@/lib/expiration';
import {
  generateEncryptionKey,
  encryptContent,
  exportKey,
  combineEncryptedData,
} from '@/lib/crypto';
import { createPaste } from '@/lib/actions/paste-actions';
import { detectLanguage } from '@/lib/language-detector';
import { formatCode } from '@/lib/formatter';

export function CreatePasteForm() {
  const [content, setContent] = useState('');
  const [language, setLanguage] = useState<LanguageValue>('plaintext');
  const [expiration, setExpiration] = useState<ExpirationOption>('1d');
  const [customExpirationDate, setCustomExpirationDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    // Detect if user is on Mac
    setIsMac(/(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgent));
  }, []);

  useEffect(() => {
    if (content.trim()) {
      const detected = detectLanguage(content);
      setLanguage(detected);
    } else {
      setLanguage('plaintext');
    }
  }, [content]);

  const handleCreatePaste = useCallback(async () => {
    if (!content.trim()) {
      setError('Please enter some content');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const detectedLanguage = detectLanguage(content);
      const key = await generateEncryptionKey();
      const { encrypted, iv } = await encryptContent(content, key);
      const encryptedData = combineEncryptedData(encrypted, iv);
      const expiresAt = calculateExpirationDate(expiration, customExpirationDate);

      const result = await createPaste({
        encrypted_content: encryptedData,
        language: detectedLanguage,
        expires_at: expiresAt ? expiresAt.toISOString() : null,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      const keyString = await exportKey(key);

      const url = `/paste/${result.id}#${keyString}`;

      // Redirect immediately to the paste
      window.location.href = url;
    } catch (err) {
      console.error('Error creating paste:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to create paste. Please try again.'
      );
      setLoading(false);
    }
  }, [content, expiration, customExpirationDate]);

  // Keyboard shortcut: Ctrl+S or Cmd+S to create paste
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (content.trim() && !loading) {
          handleCreatePaste();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [content, loading, handleCreatePaste]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleCreatePaste();
  };

  const languageLabel =
    SUPPORTED_LANGUAGES.find((l) => l.value === language)?.label || language;

  return (
    <>
      <div className="flex-1 flex flex-col p-4 gap-4">
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-4">
          <div className="flex-1 flex flex-col gap-2">
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste your code, text, or markdown here..."
              className="flex-1 font-mono text-sm resize-none"
              disabled={loading}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-3 sm:flex-1">
              {content.trim() && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {languageLabel}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              <ExpirationSelector
                value={expiration}
                onChange={setExpiration}
                onCustomDateChange={setCustomExpirationDate}
              />

              <Button type="submit" disabled={loading || !content.trim()} className="relative">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    Create Paste
                    <span className="ml-2 text-xs opacity-60">
                      {isMac ? '⌘S' : 'Ctrl+S'}
                    </span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">
              {error}
            </div>
          )}
        </form>
      </div>
    </>
  );
}
