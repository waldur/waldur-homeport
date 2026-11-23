import { saveFile } from '@/core/saveFile';

const SVG_NS = 'http://www.w3.org/2000/svg';

/** The SVG as a standalone file: its colours live in its own <style>, so
 * the file looks as it does on the page. */
const serializeSvg = (svg: SVGSVGElement): string => {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute('xmlns', SVG_NS);
  const [, , width, height] = (clone.getAttribute('viewBox') ?? '0 0 0 0')
    .split(/\s+/)
    .map(Number);
  clone.setAttribute('width', String(width));
  clone.setAttribute('height', String(height));
  clone.removeAttribute('style');
  return new XMLSerializer().serializeToString(clone);
};

export const downloadSvg = (svg: SVGSVGElement, name: string) =>
  saveFile(
    new Blob([serializeSvg(svg)], { type: 'image/svg+xml;charset=utf-8' }),
    `${name}.svg`,
  );

/** Rasterised at twice the drawing's size, for slides and documents. */
export const downloadPng = (svg: SVGSVGElement, name: string, scale = 2) =>
  new Promise<void>((resolve, reject) => {
    const source = serializeSvg(svg);
    const [, , width, height] = (svg.getAttribute('viewBox') ?? '0 0 1 1')
      .split(/\s+/)
      .map(Number);
    const url = URL.createObjectURL(
      new Blob([source], { type: 'image/svg+xml;charset=utf-8' }),
    );
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);
      const context = canvas.getContext('2d');
      if (!context) {
        URL.revokeObjectURL(url);
        reject(new Error('Canvas is not available.'));
        return;
      }
      context.scale(scale, scale);
      context.drawImage(image, 0, 0, width, height);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => {
        if (blob) {
          saveFile(blob, `${name}.png`);
          resolve();
        } else {
          reject(new Error('The image could not be created.'));
        }
      }, 'image/png');
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('The diagram could not be drawn as an image.'));
    };
    image.src = url;
  });
