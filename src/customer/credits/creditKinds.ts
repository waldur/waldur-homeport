import { translate } from '@/i18n';

import { isAffiliateProgramOn } from '../affiliate-earnings/utils';

/**
 * What each kind of organization credit is for, in one place so every view
 * explains it the same way. The kinds differ in the order usage spends them,
 * whether they expire, whether invoices paid from them count towards the
 * affiliate fee, and whether they may be withdrawn. The affiliate fee is
 * mentioned only while the affiliate program is on. The credit panel clamps a
 * description to two lines, so each stays short.
 */
export const getCreditKindHelp = () => {
  const affiliates = isAffiliateProgramOn();
  return {
    total: translate(
      'The sum of the three kinds below. Usage spends granted credit first, then paid, then withdrawable.',
    ),
    paid: affiliates
      ? translate(
          'Prepayments, such as bank transfers. Never expires, and counts towards the affiliate fee.',
        )
      : translate('Prepayments, such as bank transfers. Never expires.'),
    granted: affiliates
      ? translate(
          'Allocated by staff. Spent first, expires on the end date, and does not count towards the affiliate fee.',
        )
      : translate(
          'Allocated by staff. Spent first, and expires on the end date.',
        ),
    withdrawable: affiliates
      ? translate(
          'Earnings, such as affiliate fees. Spent last, never expires, and can be withdrawn.',
        )
      : translate(
          'Earnings of the organization. Spent last, never expires, and can be withdrawn.',
        ),
  };
};
