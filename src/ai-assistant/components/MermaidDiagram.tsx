import { useAssistantState } from '@assistant-ui/react';
import mermaid from 'mermaid';
import { FC, useEffect, useRef } from 'react';

import type { CodeBlockProps } from '@waldur/ai-assistant/lib/types';
import { translate } from '@waldur/i18n';

mermaid.initialize({
  theme: 'default',
  securityLevel: 'strict',
});

export const MermaidDiagram: FC<CodeBlockProps> = ({ code }) => {
  const ref = useRef<HTMLPreElement>(null);

  // Detect when this code block is complete
  const isComplete = useAssistantState(({ part }) => {
    if (part.type !== 'text') return false;

    const codeIndex = part.text.indexOf(code);
    if (codeIndex === -1) return false;

    const afterCode = part.text.substring(codeIndex + code.length);

    const closingBackticksMatch = afterCode.match(/^```|^\n```/);
    return closingBackticksMatch !== null;
  });

  useEffect(() => {
    if (!isComplete) return;

    (async () => {
      try {
        const isValid = await mermaid.parse(code, { suppressErrors: true });
        if (isValid === false) {
          throw new Error('Mermaid parsing failed');
        }

        const id = `mermaid-${Math.random().toString(36).slice(2)}`;

        const result = await mermaid.render(id, code);

        if (result.svg.includes('NaN')) {
          throw new Error('Mermaid rendering calculation failed (NaN)');
        }

        if (ref.current) {
          ref.current.innerHTML = result.svg;
          result.bindFunctions?.(ref.current);
        }
        if (
          result.svg.includes('Syntax error') ||
          result.svg.includes('mermaid-svg-error')
        ) {
          throw new Error('Mermaid rendered a syntax error SVG.');
        }
      } catch {
        if (ref.current) {
          ref.current.innerHTML = `<div style="color: red;">${translate('Error rendering diagram.')}</div>`;
        }
      }
    })();

    return () => {};
  }, [isComplete, code]);

  return (
    <pre ref={ref} className="aui-mermaid-diagram">
      {translate('Drawing diagram...')}
    </pre>
  );
};

MermaidDiagram.displayName = 'MermaidDiagram';
