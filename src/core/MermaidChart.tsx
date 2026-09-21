import mermaid from 'mermaid';
import { FC, useEffect, useId, useState } from 'react';

import { isDarkTheme } from 'waldur-design-tokens';

import { translate } from '@/i18n';
import { useTheme } from '@/theme/useTheme';

import { getMermaidThemeVariables } from './mermaidTheme';

interface MermaidChartProps {
  code: string;
  className?: string;
}

let iconsRegistered = false;

const registerIcons = () => {
  if (iconsRegistered) return;
  iconsRegistered = true;

  // Register Phosphor icons pack (lazy loaded)
  mermaid.registerIconPacks([
    {
      name: 'ph',
      loader: () => import('@iconify-json/ph').then((module) => module.icons),
    },
  ]);
};

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

export const MermaidChart: FC<MermaidChartProps> = ({ code, className }) => {
  const id = useId();
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Not read here: it is the dependency that re-renders the diagram when the
  // theme changes, since the colours are resolved when Mermaid is configured.
  const { theme } = useTheme();

  useEffect(() => {
    registerIcons();
    configureMermaid();

    let cancelled = false;

    const render = async () => {
      setLoading(true);
      setError(null);
      setSvgContent(null);

      try {
        // Validate the diagram first
        const isValid = await mermaid.parse(code, { suppressErrors: true });
        if (isValid === false) {
          throw new Error('Invalid Mermaid syntax');
        }

        // Generate unique ID for this render
        const mermaidId = `mermaid-${id.replace(/:/g, '-')}-${Date.now()}`;

        // Render the diagram
        const { svg } = await mermaid.render(mermaidId, code);

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
    return <div className="alert alert-danger">{error}</div>;
  }

  if (loading) {
    return (
      <div className={className} style={{ minHeight: '200px' }}>
        <div className="d-flex justify-content-center align-items-center h-100">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">{translate('Loading...')}</span>
          </div>
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
