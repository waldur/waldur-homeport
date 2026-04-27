import { translate } from '@/i18n';

import { ExportFormat } from './types';

export const EXPORT_OPTIONS: { value: ExportFormat; label: string }[] = [
  { value: 'clipboard', label: translate('Copy to clipboard') },
  { value: 'csv', label: 'CSV' },
  { value: 'pdf', label: 'PDF' },
  { value: 'excel', label: 'Excel' },
];
