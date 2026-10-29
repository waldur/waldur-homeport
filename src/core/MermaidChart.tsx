import mermaid from 'mermaid';
import { FC, useEffect, useId, useState } from 'react';

import { getCssVar, isDarkTheme } from 'waldur-design-tokens';
import { AlertItem, LoadingSpinner } from 'waldur-ui';

import { translate } from '@/i18n';
import { useTheme } from '@/theme/useTheme';

import { getMermaidThemeVariables } from './mermaidTheme';

interface MermaidChartProps {
  code: string;
  className?: string;
}

// Mermaid draws SVG from resolved colours, so it has to be configured again
// whenever the theme changes.
const configureMermaid = () => {
  mermaid.initialize({
    startOnLoad: false,
    theme: 'base',
    securityLevel: 'strict',
    maxTextSize: 250000,
    maxEdges: 2000,
    themeVariables: getMermaidThemeVariables(isDarkTheme()),
    flowchart: {
      curve: 'basis',
      padding: 20,
      htmlLabels: true,
      nodeSpacing: 50,
      rankSpacing: 50,
    },
  });
};

/**
 * Replaces each `var(--token)` in the diagram source with the token's value in
 * the current theme. Mermaid's grammar takes no `var()` in a `style` or
 * `classDef` line, so a diagram writes `style A fill:var(--status-success-bg-strong)`
 * and gets the colour that theme resolves to; the chart re-renders on a theme
 * switch, so it follows the theme like the rest of the page.
 */
export const resolveTokens = (code: string) =>
  code.replace(/var\((--[\w-]+)\)/g, (match, name) => getCssVar(name) || match);

export const MermaidChart: FC<MermaidChartProps> = ({ code, className }) => {
  const id = useId();
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Not read here: it is the dependency that re-renders the diagram when the
  // theme changes, since the colours are resolved when Mermaid is configured.
  const { theme } = useTheme();

  useEffect(() => {
    configureMermaid();

    let cancelled = false;

    const render = async () => {
      setLoading(true);
      setError(null);
      setSvgContent(null);

      try {
        const source = resolveTokens(code);
        // Validate the diagram first
        const isValid = await mermaid.parse(source, { suppressErrors: true });
        if (isValid === false) {
          throw new Error('Invalid Mermaid syntax');
        }

        // Generate unique ID for this render
        const mermaidId = `mermaid-${id.replace(/:/g, '-')}-${Date.now()}`;

        // Render the diagram
        const { svg } = await mermaid.render(mermaidId, source);

        // Check for rendering errors
        if (svg.includes('NaN') || svg.includes('Syntax error')) {
          throw new Error('Diagram rendering failed');
        }

        if (!cancelled) {
          setSvgContent(svg);
        }
      } catch {
        if (!cancelled) {
          setError(translate('Failed to render diagram'));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    render();

    // A newer run (another theme or code) owns the state from here on.
    return () => {
      cancelled = true;
    };
  }, [code, id, theme]);

  if (error) {
    return <AlertItem type="floating" variant="error" title={error} />;
  }

  if (loading) {
    return (
      <div className={className} style={{ minHeight: '200px' }}>
        <div className="flex justify-center items-center h-full">
          <LoadingSpinner
            size={32}
            className="text-brand"
            aria-label={translate('Loading...')}
          />
        </div>
      </div>
    );
  }

  if (!svgContent) {
    return null;
  }

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
};
