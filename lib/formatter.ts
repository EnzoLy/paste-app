import { type LanguageValue } from './languages';

/**
 * Basic code formatter that handles indentation and spacing
 */
export async function formatCode(content: string, language: LanguageValue): Promise<string> {
  if (!content.trim()) {
    return content;
  }

  // For JSON, we can use native formatting
  if (language === 'json') {
    try {
      const parsed = JSON.parse(content);
      return JSON.stringify(parsed, null, 2);
    } catch (error) {
      console.error('JSON formatting error:', error);
      return content;
    }
  }

  // For other languages, apply basic formatting
  try {
    let lines = content.split('\n');
    let indentLevel = 0;
    const indentSize = 2;

    const formatted = lines.map((line) => {
      const trimmed = line.trim();

      // Decrease indent for closing brackets
      if (trimmed.startsWith('}') || trimmed.startsWith(']') || trimmed.startsWith(')')) {
        indentLevel = Math.max(0, indentLevel - 1);
      }

      const indentedLine = ' '.repeat(indentLevel * indentSize) + trimmed;

      // Increase indent for opening brackets
      if (trimmed.endsWith('{') || trimmed.endsWith('[') || trimmed.endsWith('(')) {
        indentLevel++;
      }

      return indentedLine;
    });

    return formatted.join('\n');
  } catch (error) {
    console.error('Formatting error:', error);
    return content;
  }
}
