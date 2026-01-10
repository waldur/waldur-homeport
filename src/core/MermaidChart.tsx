import mermaid from 'mermaid';
import { FC, useEffect, useId, useState } from 'react';

import { translate } from '@waldur/i18n';

interface MermaidChartProps {
  code: string;
  className?: string;
}

// Helper to get CSS variable value
const getCssVar = (name: string): string => {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
};

// Dark mode fallback colors (from _colors.scss)
const DARK_GRAYS = {
  25: '#0c111d',
  50: '#161b26',
  100: '#1f242f',
  200: '#333741',
  300: '#61646c',
  400: '#85888e',
  500: '#94969c',
  600: '#cecfd2',
  700: '#ececed',
  800: '#f0f1f1',
  900: '#f5f5f6',
};

const LIGHT_GRAYS = {
  25: '#fcfcfd',
  50: '#f9fafb',
  100: '#f2f4f7',
  200: '#e4e7ec',
  300: '#d0d5dd',
  400: '#98a2b3',
  500: '#667085',
  600: '#475467',
  700: '#344054',
  800: '#182230',
  900: '#101828',
};

let initialized = false;

const initMermaid = () => {
  if (initialized) return;
  initialized = true;

  // Register Phosphor icons pack (lazy loaded)
  mermaid.registerIconPacks([
    {
      name: 'ph',
      loader: () => import('@iconify-json/ph').then((module) => module.icons),
    },
  ]);

  const isDarkMode =
    document.documentElement.getAttribute('data-bs-theme') === 'dark';

  const grays = isDarkMode ? DARK_GRAYS : LIGHT_GRAYS;

  // In dark mode, brand colors are inverted:
  // light 100 -> dark 800, light 200 -> dark 700, etc.
  const primaryColor = isDarkMode
    ? getCssVar('--waldur-brand-800') || '#1f5000'
    : getCssVar('--waldur-brand-100') || '#e6f0e3';

  const primaryBorderColor = isDarkMode
    ? getCssVar('--waldur-brand-500') || '#398500'
    : getCssVar('--waldur-brand-400') || '#6ca359';

  const secondaryColor = isDarkMode
    ? getCssVar('--waldur-brand-900') || '#174000'
    : getCssVar('--waldur-brand-50') || '#f1f7ef';

  const secondaryBorderColor = isDarkMode
    ? getCssVar('--waldur-brand-700') || '#286100'
    : getCssVar('--waldur-brand-200') || '#c3dabb';

  const clusterBorderColor = isDarkMode
    ? getCssVar('--waldur-brand-600') || '#307300'
    : getCssVar('--waldur-brand-300') || '#97bf89';

  // Text colors - in dark mode use light grays
  const primaryTextColor = grays[isDarkMode ? 100 : 800];
  const textColor = grays[isDarkMode ? 700 : 700];
  const lineColor = grays[400];

  // Background colors
  const tertiaryColor = grays[isDarkMode ? 200 : 100];
  const backgroundColor = isDarkMode ? grays[50] : '#ffffff';
  const noteBkgColor = grays[isDarkMode ? 100 : 50];
  const noteBorderColor = grays[300];

  mermaid.initialize({
    startOnLoad: false,
    theme: 'base',
    securityLevel: 'strict',
    themeVariables: {
      // Dark mode flag
      darkMode: isDarkMode,

      // Core colors matching Waldur brand
      primaryColor,
      primaryBorderColor,
      primaryTextColor,
      secondaryColor,
      secondaryBorderColor,
      secondaryTextColor: primaryTextColor,
      tertiaryColor,
      tertiaryBorderColor: grays[300],
      tertiaryTextColor: textColor,

      // Text and lines
      lineColor,
      textColor,

      // Background
      background: backgroundColor,
      mainBkg: primaryColor,

      // Flowchart specific
      nodeBorder: primaryBorderColor,
      clusterBkg: secondaryColor,
      clusterBorder: clusterBorderColor,
      defaultLinkColor: lineColor,

      // State diagram specific
      labelColor: textColor,
      altBackground: tertiaryColor,

      // Notes
      noteBkgColor,
      noteTextColor: textColor,
      noteBorderColor,

      // Font
      fontFamily:
        'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
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

  useEffect(() => {
    initMermaid();

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

        setSvgContent(svg);
      } catch {
        setError(translate('Failed to render diagram'));
      } finally {
        setLoading(false);
      }
    };

    render();
  }, [code, id]);

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
