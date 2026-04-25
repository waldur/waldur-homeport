interface SvgPlaceholderOptions {
  width?: number;
  height?: number;
  bgColor?: string;
  textColor?: string;
  text?: string;
  fontSize?: number;
}

export function generateSvgPlaceholder({
  width = 300,
  height = 150,
  bgColor = '#aaa',
  textColor = '#333',
  text = `${width}\u00d7${height}`,
  fontSize = Math.floor(Math.min(width, height) * 0.2),
}: SvgPlaceholderOptions = {}): string {
  const dy = fontSize * 0.35;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect fill="${bgColor}" width="${width}" height="${height}"/>
    <text fill="${textColor}" font-family="sans-serif" font-size="${fontSize}" dy="${dy}" font-weight="bold" x="50%" y="50%" text-anchor="middle">${text}</text>
  </svg>`;

  const cleaned = svg.replace(/[\t\n\r]/gim, '').replace(/\s\s+/g, ' ');

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(cleaned)}`;
}

export const SVGImagePlaceholder = (props: SvgPlaceholderOptions) => (
  <img src={generateSvgPlaceholder(props)} alt="Placeholder" />
);
