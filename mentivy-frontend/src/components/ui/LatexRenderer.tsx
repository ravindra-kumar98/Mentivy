'use client';

import React, { useMemo } from 'react';
import katex from 'katex';

interface LatexRendererProps {
  content: string;
  className?: string;
  inline?: boolean;
}

export function LatexRenderer({ content, className = '', inline = false }: LatexRendererProps) {
  const renderedHtml = useMemo(() => {
    if (!content) return '';

    try {
      // Regular expression to match $$block math$$ or $inline math$
      // Also supports \( inline \) and \[ block \]
      const mathRegex = /(\$\$[\s\S]*?\$\$|\$[^\$\n]+?\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\))/g;

      const parts = content.split(mathRegex);

      return parts.map((part) => {
        if (!part) return '';

        // Block Math: $$...$$ or \[...\]
        if (part.startsWith('$$') && part.endsWith('$$')) {
          const formula = part.slice(2, -2).trim();
          try {
            return katex.renderToString(formula, { displayMode: true, throwOnError: false });
          } catch (e) {
            return `<span class="text-red-500 font-mono text-xs">${part}</span>`;
          }
        }

        if (part.startsWith('\\[') && part.endsWith('\\]')) {
          const formula = part.slice(2, -2).trim();
          try {
            return katex.renderToString(formula, { displayMode: true, throwOnError: false });
          } catch (e) {
            return `<span class="text-red-500 font-mono text-xs">${part}</span>`;
          }
        }

        // Inline Math: $...$ or \(...\)
        if (part.startsWith('$') && part.endsWith('$')) {
          const formula = part.slice(1, -1).trim();
          try {
            return katex.renderToString(formula, { displayMode: false, throwOnError: false });
          } catch (e) {
            return `<span class="text-red-500 font-mono text-xs">${part}</span>`;
          }
        }

        if (part.startsWith('\\(') && part.endsWith('\\)')) {
          const formula = part.slice(2, -2).trim();
          try {
            return katex.renderToString(formula, { displayMode: false, throwOnError: false });
          } catch (e) {
            return `<span class="text-red-500 font-mono text-xs">${part}</span>`;
          }
        }

        // Standard text: escape HTML and preserve line breaks
        return part
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/\n/g, '<br />');
      }).join('');
    } catch (err) {
      return content;
    }
  }, [content]);

  if (inline) {
    return (
      <span 
        className={className} 
        dangerouslySetInnerHTML={{ __html: renderedHtml }} 
      />
    );
  }

  return (
    <div 
      className={className} 
      dangerouslySetInnerHTML={{ __html: renderedHtml }} 
    />
  );
}

export default LatexRenderer;
