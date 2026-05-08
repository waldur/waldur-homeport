import { translate } from '@/i18n';
import { getUserLocale } from '@/i18n/LanguageUtilsService';

interface PeriodOption {
  offset: number;
  label: string;
}

// Build a list of selectable period offsets for a given OfferingComponent.limit_period.
// Mirrors the (slightly trimmed) logic the existing timeline widget uses, but exposed
// so multiple views can share period selection. Today is taken in caller-controlled
// time (defaults to Date.now()) so unit tests can pin it.
export function buildPeriodOptions(
  limitPeriod: string | null | undefined,
  today: Date = new Date(),
  count = 6,
): PeriodOption[] {
  if (!limitPeriod || limitPeriod === 'total') {
    return [{ offset: 0, label: translate('Total (lifetime)') }];
  }
  const opts: PeriodOption[] = [];
  for (let off = 0; off >= -count; off--) {
    let label = '';
    if (limitPeriod === 'month') {
      const d = new Date(today.getFullYear(), today.getMonth() + off, 1);
      label = d.toLocaleString(getUserLocale(), {
        month: 'short',
        year: 'numeric',
      });
    } else if (limitPeriod === 'quarterly') {
      const currentQ = Math.floor(today.getMonth() / 3) + 1;
      let q = currentQ + off;
      let y = today.getFullYear();
      while (q < 1) {
        q += 4;
        y -= 1;
      }
      label = `Q${q} ${y}`;
    } else if (limitPeriod === 'annual') {
      label = `${today.getFullYear() + off}`;
      if (off === -1) {
        opts.push({ offset: off, label });
        break;
      }
    } else {
      label = off === 0 ? translate('Current') : `${off}`;
    }
    if (off === 0) label += ` · ${translate('current')}`;
    opts.push({ offset: off, label });
  }
  return opts;
}
