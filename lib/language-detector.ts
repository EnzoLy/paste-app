import { type LanguageValue } from './languages';

/**
 * Detects the programming language from code content using pattern matching
 */
export function detectLanguage(content: string): LanguageValue {
  if (!content.trim()) {
    return 'plaintext';
  }

  const lines = content.split('\n');
  const trimmedContent = content.trim();

  // Check for JSON (must be valid)
  if (
    (trimmedContent.startsWith('{') || trimmedContent.startsWith('[')) &&
    (trimmedContent.endsWith('}') || trimmedContent.endsWith(']'))
  ) {
    try {
      JSON.parse(trimmedContent);
      return 'json';
    } catch {
      // Not valid JSON, continue checking
    }
  }

  // Check for Markdown (do this early to avoid false positives)
  if (
    /^#{1,6}\s/.test(trimmedContent) ||
    (/\[.+\]\(.+\)/.test(content) && !/<\w+/.test(content)) ||
    /^[-*+]\s/.test(trimmedContent) ||
    /^\d+\.\s/.test(trimmedContent)
  ) {
    return 'markdown';
  }

  // Check for YAML
  if (/^---\s*$|^[\w-]+:\s*.+$/m.test(content) && !content.includes('{') && !content.includes(';')) {
    return 'yaml';
  }

  // Check for Dockerfile
  if (/^FROM\s+\w+/im.test(content) || /^RUN\s+|^CMD\s+|^COPY\s+|^ADD\s+/im.test(content)) {
    return 'dockerfile';
  }

  // Check for Shell/Bash
  if (
    /^#!\/bin\/(bash|sh)/.test(trimmedContent) ||
    (/\b(echo|export|source|alias)\b/.test(content) && !/\bconst\b|\blet\b|\bvar\b/.test(content))
  ) {
    if (/\$(env:|PSModulePath)|\[cmdletbinding\(\)\]/i.test(content)) {
      return 'powershell';
    }
    return 'bash';
  }

  // Check for PowerShell
  if (/\$(env:|PSModulePath)|\[cmdletbinding\(\)\]|Param\s*\(/i.test(content)) {
    return 'powershell';
  }

  // Check for Python
  if (
    /\b(def|class|import|from|if __name__|print|lambda|yield|async def)\b/.test(content) &&
    !(/\bfunction\b|\bconst\b|\blet\b|\bvar\b/.test(content))
  ) {
    return 'python';
  }

  // Check for TypeScript/TSX (check BEFORE HTML/JSX)
  const hasJSXElements = /<[A-Z]\w*/.test(content) || /return\s*\(?\s*</.test(content) || /<\/\w+>/.test(content);
  const hasTypeScript = /\b(interface|type|enum)\s+\w+/.test(content) ||
    /:\s*(string|number|boolean|any|void|unknown|React\.|JSX\.)/.test(content) ||
    /<.*>\s*\(/.test(content) || // Generic functions
    /as\s+(const|string|number|any)/.test(content);

  if (hasTypeScript && hasJSXElements) {
    return 'tsx';
  }

  if (hasTypeScript) {
    return 'typescript';
  }

  // Check for JSX (React components with JSX but no TypeScript)
  if (hasJSXElements && /\b(import.*from ['"]react|export (default )?function|const \w+ = \(\)?\s*=>)/.test(content)) {
    return 'jsx';
  }

  // Check for JavaScript
  if (
    /\b(function|const|let|var|=>|import|export|require)\b/.test(content) ||
    /console\.(log|error|warn)/.test(content)
  ) {
    return 'javascript';
  }

  // Check for SQL
  if (/\b(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|FROM|WHERE|JOIN)\b/i.test(content)) {
    return 'sql';
  }

  // Check for HTML (check AFTER TypeScript/JSX)
  if (/<html|<!DOCTYPE html|<head|<body/i.test(content)) {
    return 'html';
  }

  // Check for XML
  if (/^<\?xml/.test(trimmedContent)) {
    return 'xml';
  }

  // Check for Java
  if (
    /\b(public|private|protected|class|interface|extends|implements)\b/.test(content) &&
    /\bclass\s+\w+/.test(content)
  ) {
    return 'java';
  }

  // Check for C#
  if (
    /\b(namespace|using|public|private|class|interface)\b/.test(content) &&
    /using\s+System/.test(content)
  ) {
    return 'csharp';
  }

  // Check for Go
  if (
    /^package\s+\w+/.test(trimmedContent) ||
    /\bfunc\s+\w+\s*\(/.test(content) ||
    /import\s*\([\s\S]*\)/.test(content)
  ) {
    return 'go';
  }

  // Check for Rust
  if (
    /\b(fn|let|mut|impl|trait|struct|enum|pub|use)\b/.test(content) &&
    /fn\s+\w+/.test(content)
  ) {
    return 'rust';
  }

  // Check for Ruby
  if (
    /\b(def|end|class|module|require|puts|attr_accessor)\b/.test(content) ||
    /^#!/.test(trimmedContent) && /ruby/.test(trimmedContent)
  ) {
    return 'ruby';
  }

  // Check for PHP
  if (/^<\?php|<\?=/.test(trimmedContent) || /\$\w+\s*=/.test(content)) {
    return 'php';
  }

  // Check for Swift
  if (
    /\b(func|var|let|class|struct|enum|import|protocol)\b/.test(content) &&
    /import\s+Foundation|import\s+UIKit/.test(content)
  ) {
    return 'swift';
  }

  // Check for Kotlin
  if (
    /\b(fun|val|var|class|object|interface|package)\b/.test(content) &&
    /fun\s+\w+/.test(content)
  ) {
    return 'kotlin';
  }

  // Check for C
  if (
    /\b(int|char|float|double|void|struct|printf|scanf|#include)\b/.test(content) &&
    /#include\s*<[\w.]+>/.test(content)
  ) {
    return 'c';
  }

  // Check for C++
  if (
    /\b(class|namespace|template|std::|cout|cin|#include)\b/.test(content) ||
    /#include\s*<iostream>/.test(content)
  ) {
    return 'cpp';
  }

  // Check for CSS/SCSS
  if (/[\w-]+\s*\{[\s\S]*\}/.test(content) && /:\s*[^;]+;/.test(content)) {
    if (/\$[\w-]+:|@mixin|@include|@extend/.test(content)) {
      return 'scss';
    }
    return 'css';
  }

  // Default to plaintext
  return 'plaintext';
}
