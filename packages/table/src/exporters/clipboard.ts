import Papa from 'papaparse';

export default function exportToClipboard(_, data) {
  const text = Papa.unparse(data);
  return navigator.clipboard.writeText(text);
}
