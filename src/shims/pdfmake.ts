import { ENV } from '@waldur/core/services';

// Avoid to re-download the fonts every time pdfmake is used, useful for SPA.
let pdfMakeInstance: any = null;

export async function loadPdfMake() {
  if (!pdfMakeInstance) {
    const fontFamilies = ENV.fontFamilies;
    const pdfMake = (await import(/* webpackChunkName: "pdfmake" */ 'pdfmake/build/pdfmake')).default;
    pdfMake.fonts = fontFamilies;
    pdfMake.vfs = await loadVfs(fontFamilies);
    pdfMakeInstance = pdfMake;
  }

  return pdfMakeInstance;
}

async function loadVfs(fontFamilies) {
  // Load fonts into Virtual File System for pdfkit
  const baseURL = 'fonts/';
  const vfs = {};
  // tslint:disable-next-line: forin
  for (const fontFamily in fontFamilies) {
    // tslint:disable-next-line: forin
    for (const font in fontFamilies[fontFamily]) {
      const file = fontFamilies[fontFamily][font];
      vfs[file] = await getAsDataURL(baseURL + file);
    }
  }
  return vfs;
}

async function getAsDataURL(url: string): Promise<string> {
  // Given the URL load base64-encoded data using fetch and FileReader API.
  // Please note that it would not work in older browsers without polyfill
  const res = await fetch(url, { method: 'GET' });
  const blob = await res.blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    // Strip data URL so that only base64-encoded data is returned
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
