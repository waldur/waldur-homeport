import {
  ClipboardTextIcon,
  FilePngIcon,
  FileSvgIcon,
} from '@phosphor-icons/react';
import { FC, useCallback } from 'react';

import { translate } from '@/i18n';
import { ActionItem } from '@/resource/actions/ActionItem';
import { useNotify } from '@/store/notify';
import { ActionDropdownButton } from '@/table/ActionDropdownButton';

interface Props {
  /** Ref to the wrapper div that contains the rendered <svg>. */
  getSvg: () => SVGElement | null;
  /** The raw mermaid source code (for the Copy mermaid source action). */
  mermaidCode: string;
  /** Used in the downloaded filename. */
  filenameBase: string;
}

const triggerDownload = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Defer revoke so the click can settle.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const SVG_NS = 'http://www.w3.org/2000/svg';

// Chrome and Firefox taint a canvas when an SVG containing <foreignObject>
// is drawn onto it, regardless of whether the foreign content actually
// loads cross-origin resources. Mermaid flowcharts render labels through
// foreignObject when `htmlLabels: true` (our default), so PNG export of
// the topology breaks with `Tainted canvases may not be exported`.
// Walk the clone in parallel with the live SVG, copy text + computed
// font/colour out, and replace each foreignObject with a positioned
// <text>. The on-screen render is untouched.
const inlineForeignObjects = (
  clone: SVGElement,
  original: SVGElement,
): void => {
  const clonedFos = Array.from(clone.querySelectorAll('foreignObject'));
  const liveFos = original.querySelectorAll('foreignObject');
  clonedFos.forEach((fo, i) => {
    const live = liveFos[i] as SVGForeignObjectElement | undefined;
    const lines: string[] = [];
    const buf = { text: '' };
    const flush = () => {
      const t = buf.text.replace(/\s+/g, ' ').trim();
      if (t) lines.push(t);
      buf.text = '';
    };
    const walk = (node: Node) => {
      node.childNodes.forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          buf.text += child.textContent || '';
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          const tag = (child as Element).tagName.toLowerCase();
          if (tag === 'br') {
            flush();
          } else if (tag === 'p' || tag === 'div') {
            flush();
            walk(child);
            flush();
          } else {
            walk(child);
          }
        }
      });
    };
    walk(fo);
    flush();

    if (lines.length === 0) {
      fo.parentNode?.removeChild(fo);
      return;
    }

    const x = parseFloat(fo.getAttribute('x') || '0');
    const y = parseFloat(fo.getAttribute('y') || '0');
    const width = parseFloat(fo.getAttribute('width') || '0');
    const height = parseFloat(fo.getAttribute('height') || '0');

    const styleSource =
      (live && (live.querySelector('p, span, div') as Element | null)) ||
      live ||
      null;
    const style = styleSource
      ? window.getComputedStyle(styleSource)
      : ({} as CSSStyleDeclaration);
    const fontSize = parseFloat(style.fontSize as string) || 14;
    const fontFamily = (style.fontFamily as string) || 'sans-serif';
    const fontWeight = (style.fontWeight as string) || 'normal';
    const fill = (style.color as string) || 'currentColor';

    const cx = x + width / 2;
    const cy = y + height / 2;
    const lineHeight = fontSize * 1.2;
    const startDy = -((lines.length - 1) * lineHeight) / 2;

    const text = clone.ownerDocument!.createElementNS(SVG_NS, 'text');
    text.setAttribute('x', String(cx));
    text.setAttribute('y', String(cy));
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'central');
    text.setAttribute('font-family', fontFamily);
    text.setAttribute('font-size', String(fontSize));
    text.setAttribute('font-weight', fontWeight);
    text.setAttribute('fill', fill);

    lines.forEach((line, idx) => {
      const tspan = clone.ownerDocument!.createElementNS(SVG_NS, 'tspan');
      tspan.setAttribute('x', String(cx));
      tspan.setAttribute('dy', idx === 0 ? `${startDy}px` : `${lineHeight}px`);
      tspan.textContent = line;
      text.appendChild(tspan);
    });

    fo.parentNode?.replaceChild(text, fo);
  });
};

const serializeSvg = (
  svg: SVGElement,
  options: { width?: number; height?: number; inlineForeign?: boolean } = {},
): string => {
  // Clone so we don't mutate the live DOM.
  const clone = svg.cloneNode(true) as SVGElement;
  // Ensure xmlns is present (required for standalone files).
  if (!clone.getAttribute('xmlns')) {
    clone.setAttribute('xmlns', SVG_NS);
  }
  if (!clone.getAttribute('xmlns:xlink')) {
    clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
  }
  // Mermaid's rendered SVG uses `style="max-width: ..."` instead of width/
  // height attributes, so an <Image> created from the blob has zero
  // natural size and the canvas draws blank. Set explicit dimensions
  // when we're rasterising.
  if (options.width && options.height) {
    clone.setAttribute('width', String(options.width));
    clone.setAttribute('height', String(options.height));
    const style = clone.getAttribute('style') || '';
    clone.setAttribute(
      'style',
      style.replace(/max-width\s*:[^;"']*/i, '').trim(),
    );
  }
  if (options.inlineForeign) {
    inlineForeignObjects(clone, svg);
  }
  return new XMLSerializer().serializeToString(clone);
};

const loadImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (e) =>
      reject(
        new Error(
          `SVG failed to load as image: ${(e as ErrorEvent)?.message || ''}`,
        ),
      );
    img.src = url;
  });

const rasterise = async (svg: SVGElement, dpr = 2): Promise<Blob> => {
  const rect = svg.getBoundingClientRect();
  // Fall back to the SVG's intrinsic viewBox if the bounding rect is
  // zero (can happen if the element is briefly detached during paint).
  let width = Math.ceil(rect.width);
  let height = Math.ceil(rect.height);
  if (!width || !height) {
    const viewBox = svg.getAttribute('viewBox')?.split(/\s+/).map(Number);
    if (viewBox?.length === 4) {
      width = width || Math.ceil(viewBox[2]);
      height = height || Math.ceil(viewBox[3]);
    }
  }
  width = Math.max(1, width || 800);
  height = Math.max(1, height || 600);

  const source = serializeSvg(svg, { width, height, inlineForeign: true });
  const svgBlob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);
  try {
    const img = await loadImage(url);
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context unavailable');
    ctx.scale(dpr, dpr);
    // Background matches Waldur's dark panel so dark-mode diagrams stay
    // legible when pasted into other tools.
    ctx.fillStyle = '#0c111d';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);
    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b), 'image/png'),
    );
    if (!blob) throw new Error('Canvas toBlob returned null');
    return blob;
  } finally {
    URL.revokeObjectURL(url);
  }
};

export const TopologyExport: FC<Props> = ({
  getSvg,
  mermaidCode,
  filenameBase,
}) => {
  const notify = useNotify();

  const exportSvg = useCallback(() => {
    const svg = getSvg();
    if (!svg) {
      notify.showError(translate('Diagram is not ready yet.'));
      return;
    }
    const source = `<?xml version="1.0" encoding="UTF-8"?>\n${serializeSvg(svg, {})}`;
    triggerDownload(
      new Blob([source], { type: 'image/svg+xml;charset=utf-8' }),
      `${filenameBase}.svg`,
    );
  }, [getSvg, filenameBase, notify]);

  const exportPng = useCallback(async () => {
    const svg = getSvg();
    if (!svg) {
      notify.showError(translate('Diagram is not ready yet.'));
      return;
    }
    try {
      const blob = await rasterise(svg);
      triggerDownload(blob, `${filenameBase}.png`);
    } catch (err) {
      // Surface the underlying error in the console so we can diagnose
      // browser-specific failures (CSP, foreignObject, etc.) on report.
      // eslint-disable-next-line no-console
      console.error('PNG export failed', err);
      notify.showError(translate('Failed to render the diagram as PNG.'));
    }
  }, [getSvg, filenameBase, notify]);

  const copyMermaid = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(mermaidCode);
      notify.showSuccess(translate('Mermaid source copied to clipboard.'));
    } catch {
      notify.showError(translate('Could not access the clipboard.'));
    }
  }, [mermaidCode, notify]);

  return (
    <ActionDropdownButton
      variant="tertiary"
      title={translate('Export')}
      align="end"
    >
      <ActionItem
        title={translate('Download SVG')}
        action={exportSvg}
        iconNode={<FileSvgIcon weight="bold" />}
      />
      <ActionItem
        title={translate('Download PNG')}
        action={exportPng}
        iconNode={<FilePngIcon weight="bold" />}
      />
      <ActionItem
        title={translate('Copy mermaid source')}
        action={copyMermaid}
        iconNode={<ClipboardTextIcon weight="bold" />}
      />
    </ActionDropdownButton>
  );
};
