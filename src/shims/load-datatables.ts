import { loadPdfMake } from '@waldur/shims/pdfmake';

export async function loadDatatables() {
  await loadPdfMake();
  await import(/* webpackChunkName: "datatables" */ '@waldur/shims/datatables');
}
