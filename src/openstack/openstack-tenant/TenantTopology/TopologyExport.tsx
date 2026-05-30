import {
  ClipboardTextIcon,
  FilePngIcon,
  FileSvgIcon,
  PrinterIcon,
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

const serializeSvg = (
  svg: SVGElement,
  width?: number,
  height?: number,
): string => {
  // Clone so we don't mutate the live DOM.
  const clone = svg.cloneNode(true) as SVGElement;
  // Ensure xmlns is present (required for standalone files).
  if (!clone.getAttribute('xmlns')) {
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  }
  if (!clone.getAttribute('xmlns:xlink')) {
    clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
  }
  // Mermaid's rendered SVG uses `style="max-width: ..."` instead of width/
  // height attributes, so an <Image> created from the blob has zero
  // natural size and the canvas draws blank. Set explicit dimensions
  // when we're rasterising.
  if (width && height) {
    clone.setAttribute('width', String(width));
    clone.setAttribute('height', String(height));
    const style = clone.getAttribute('style') || '';
    clone.setAttribute(
      'style',
      style.replace(/max-width\s*:[^;"']*/i, '').trim(),
    );
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

  const source = serializeSvg(svg, width, height);
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
    const source = `<?xml version="1.0" encoding="UTF-8"?>\n${serializeSvg(svg)}`;
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

  const print = useCallback(() => {
    window.print();
  }, []);

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
      <ActionItem
        title={translate('Print / Save as PDF')}
        action={print}
        iconNode={<PrinterIcon weight="bold" />}
      />
    </ActionDropdownButton>
  );
};
