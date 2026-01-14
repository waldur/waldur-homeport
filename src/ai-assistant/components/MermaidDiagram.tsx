import mermaid from 'mermaid';
import { FC, useEffect, useRef, useState } from 'react';

import { SkeletonLoader } from '@waldur/ai-assistant/components/shared/SkeletonLoader';
import { translate } from '@waldur/i18n';

mermaid.initialize({
  theme: 'default',
  securityLevel: 'strict',
});

interface MermaidDiagramProps {
  code: string;
}

export const MermaidDiagram: FC<MermaidDiagramProps> = ({ code }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isRendering, setIsRendering] = useState(true);

  useEffect(() => {
    if (!code) {
      setIsRendering(true);
      return;
    }

    setIsRendering(true);
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
        setIsRendering(false);
      } catch {
        if (ref.current) {
          ref.current.innerHTML = `<div style="color: red;">${translate('Error rendering diagram')}</div>`;
          setIsRendering(false);
        }
      }
    })();

    return () => {};
  }, [code]);

  return (
    <div className="aui-mermaid-block">
      {isRendering && <SkeletonLoader />}
      <div
        ref={ref}
        className="aui-mermaid-diagram"
        style={{ display: isRendering ? 'none' : 'block' }}
      />
    </div>
  );
};

MermaidDiagram.displayName = 'MermaidDiagram';
