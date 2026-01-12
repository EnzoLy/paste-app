'use client';

import { useEffect, useState, useRef } from 'react';
import { codeToHtml } from 'shiki';
import { useTheme } from 'next-themes';

interface SyntaxHighlighterProps {
  code: string;
  language: string;
}

export function SyntaxHighlighter({ code, language }: SyntaxHighlighterProps) {
  const [html, setHtml] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function highlight() {
      try {
        setLoading(true);
        const result = await codeToHtml(code, {
          lang: language === 'plaintext' ? 'text' : language,
          theme: theme === 'dark' ? 'github-dark' : 'github-light',
        });
        setHtml(result);
      } catch (error) {
        console.error('Syntax highlighting error:', error);
        // Fallback to plaintext
        const fallback = await codeToHtml(code, {
          lang: 'text',
          theme: theme === 'dark' ? 'github-dark' : 'github-light',
        });
        setHtml(fallback);
      } finally {
        setLoading(false);
      }
    }

    highlight();
  }, [code, language, theme]);

  // Add click handler and styling for URLs in code
  useEffect(() => {
    if (!containerRef.current || loading) return;

    const pre = containerRef.current.querySelector('pre');
    if (!pre) return;

    // URL regex pattern - matches http:// or https:// URLs
    const urlPattern = /https?:\/\/[^\s<>"'`]+/g;

    // Find all text nodes and wrap URLs in clickable styled spans
    const walker = document.createTreeWalker(pre, NodeFilter.SHOW_TEXT);
    const textNodes: Node[] = [];

    let node;
    while ((node = walker.nextNode())) {
      textNodes.push(node);
    }

    // Process each text node
    textNodes.forEach((textNode) => {
      const text = textNode.textContent || '';
      const matches = [...text.matchAll(new RegExp(urlPattern, 'g'))];

      if (matches.length === 0) return;

      const parent = textNode.parentElement;
      if (!parent) return;

      // Create a document fragment to hold the new nodes
      const fragment = document.createDocumentFragment();
      let lastIndex = 0;

      matches.forEach((match) => {
        const url = match[0];
        const startIndex = match.index!;

        // Add text before the URL
        if (startIndex > lastIndex) {
          fragment.appendChild(
            document.createTextNode(text.substring(lastIndex, startIndex))
          );
        }

        // Create styled span for the URL
        const urlSpan = document.createElement('span');
        urlSpan.textContent = url;
        urlSpan.className = 'url-link';
        urlSpan.style.cursor = 'pointer';
        urlSpan.style.textDecoration = 'underline';
        urlSpan.style.textDecorationColor = 'rgba(59, 130, 246, 0.5)';
        urlSpan.style.color = 'inherit';
        urlSpan.dataset.url = url;

        // Add hover effect
        urlSpan.addEventListener('mouseenter', () => {
          urlSpan.style.color = '#3b82f6'; // blue-500
          urlSpan.style.textDecorationColor = '#3b82f6';
        });

        urlSpan.addEventListener('mouseleave', () => {
          urlSpan.style.color = 'inherit';
          urlSpan.style.textDecorationColor = 'rgba(59, 130, 246, 0.5)';
        });

        // Add click handler
        urlSpan.addEventListener('click', (e) => {
          const selection = window.getSelection();
          if (selection && selection.toString().length > 0) {
            return;
          }
          e.preventDefault();
          e.stopPropagation();
          window.open(url, '_blank', 'noopener,noreferrer');
        });

        fragment.appendChild(urlSpan);
        lastIndex = startIndex + url.length;
      });

      // Add remaining text after the last URL
      if (lastIndex < text.length) {
        fragment.appendChild(document.createTextNode(text.substring(lastIndex)));
      }

      // Replace the text node with the fragment
      parent.replaceChild(fragment, textNode);
    });

    return () => {
      // Cleanup is handled by React re-render
    };
  }, [html, loading]);

  if (loading) {
    return (
      <div className="rounded-lg border bg-muted/50 p-4">
        <pre className="text-sm text-muted-foreground">Loading syntax highlighting...</pre>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="rounded-lg overflow-hidden border [&>pre]:!m-0 [&>pre]:!rounded-none [&>pre]:!border-none [&>pre]:p-4 [&>pre]:overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
