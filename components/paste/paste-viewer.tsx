'use client';

import { useState } from 'react';
import { Copy, Check, Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SyntaxHighlighter } from './syntax-highlighter';
import { MarkdownRenderer } from './markdown-renderer';
import { formatExpirationTime } from '@/lib/expiration';
import { SUPPORTED_LANGUAGES } from '@/lib/languages';

interface PasteViewerProps {
  content: string;
  language: string;
  createdAt: string;
  expiresAt: string | null;
}

export function PasteViewer({ content, language, createdAt, expiresAt }: PasteViewerProps) {
  const [copied, setCopied] = useState(false);

  const languageLabel =
    SUPPORTED_LANGUAGES.find((l) => l.value === language)?.label || language;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `paste-${Date.now()}.${language === 'markdown' ? 'md' : 'txt'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const isMarkdown = language === 'markdown';

  return (
    <div className="flex-1 flex flex-col p-4 gap-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <Badge variant="secondary" className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            {languageLabel}
          </Badge>
          <span className="text-sm text-muted-foreground">
            Created {new Date(createdAt).toLocaleDateString()}
          </span>
          {expiresAt && (
            <Badge variant="outline">{formatExpirationTime(expiresAt)}</Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={handleCopy} size="sm" variant="outline">
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2 text-green-600" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </>
            )}
          </Button>
          <Button onClick={handleDownload} size="sm" variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {isMarkdown ? (
          <MarkdownRenderer content={content} />
        ) : (
          <SyntaxHighlighter code={content} language={language} />
        )}
      </div>
    </div>
  );
}
