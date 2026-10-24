import { ArrowSquareOutIcon } from '@phosphor-icons/react';

import { buttonVariants } from 'waldur-ui';

import { translate } from '@/i18n';

export const OfferingAccessButton = ({ offering }) =>
  offering.access_url ? (
    <a
      href={offering.access_url}
      target="_blank"
      rel="noopener noreferrer"
      className={`min-w-[100px] ${buttonVariants({ variant: 'primary' })}`}
    >
      <ArrowSquareOutIcon size={20} weight="bold" />
      {translate('Access')}
    </a>
  ) : null;
