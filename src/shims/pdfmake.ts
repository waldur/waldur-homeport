import Axios from 'axios';

import { ENV } from '@waldur/core/services';

// Avoid to re-download the fonts every time pdfmake is used, useful for SPA.
let pdfMakeInstance: any = null;

async function loadVfs(fontFamilies) {
  // Load fonts into Virtual File System for pdfkit
  const baseURL = 'fonts/';
  const vfs = {};

  for (const fontFamily in fontFamilies) {
    for (const font in fontFamilies[fontFamily]) {
      const file = fontFamilies[fontFamily][font];
      const response = await Axios.get(baseURL + file, {
        responseType: 'arraybuffer',
      });
      vfs[file] = response.data;
    }
  }
  return vfs;
}

export async function loadPdfMake() {
  if (!pdfMakeInstance) {
    const fontFamilies = ENV.fontFamilies;
    const pdfMake = (
      await import(/* webpackChunkName: "pdfmake" */ 'pdfmake/build/pdfmake')
    ).default;
    pdfMake.fonts = fontFamilies;
    pdfMake.vfs = await loadVfs(fontFamilies);
    pdfMakeInstance = pdfMake;
  }

  return pdfMakeInstance;
}
