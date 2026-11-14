import { toCsv } from './csv';

export default function exportToClipboard(_, data) {
  const text = toCsv(data);
  return navigator.clipboard.writeText(text);
}
