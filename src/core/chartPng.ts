import { getChartThemeColors } from '@/dashboard/chartColors';
import { saveFile } from '@/table/exporters/saveFile';

/**
 * The chart drawn to a PNG data URL, on the surface it is drawn on (so its
 * text stays legible) unless `backgroundColor` says otherwise.
 */
export const getChartPngDataUrl = (
  chartInstance,
  backgroundColor = getChartThemeColors().surface,
): string =>
  chartInstance.getDataURL({
    type: 'png',
    pixelRatio: 2,
    backgroundColor,
    excludeComponents: ['toolbox'],
  });

/**
 * Downloads the chart as `name`.png through saveFile, like every other
 * export. Clicking a detached link to the data URL itself is not a download
 * everywhere: some browsers and embedded views save the page instead, and
 * Chrome refuses data URLs over 2 MB.
 */
export const saveChartPng = (
  chartInstance,
  name: string,
  backgroundColor?: string,
) => {
  // A disposed instance draws nothing; saving it would write an empty file.
  if (!chartInstance || chartInstance.isDisposed?.()) return;
  const dataUrl = getChartPngDataUrl(chartInstance, backgroundColor);
  const [, base64] = dataUrl.split(',');
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  saveFile(new Blob([bytes], { type: 'image/png' }), `${name}.png`);
};
