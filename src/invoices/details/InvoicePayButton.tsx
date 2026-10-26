import { MoneyIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { buttonVariants, Menu } from 'waldur-ui';

import { translate } from '@/i18n';
import { useCustomer } from '@/workspace/hooks';

import { Invoice } from '../types';

import { hasMonthlyPaymentProfile } from './utils';

interface InvoicePayButtonProps {
  row: Invoice;
  asButton?: boolean;
}

export const InvoicePayButton: FC<InvoicePayButtonProps> = ({
  row,
  asButton,
}) => {
  const customer = useCustomer();
  const showPayment = customer && hasMonthlyPaymentProfile(customer);
  if (!row?.payment_url || !showPayment || row.state !== 'created') {
    return null;
  }

  return asButton ? (
    <a
      className={`${buttonVariants({ variant: 'warning' })} px-2`}
      href={row.payment_url}
      target="_self"
      rel="noopener noreferrer"
    >
      <MoneyIcon size={20} weight="bold" />
      {translate('Pay')}
    </a>
  ) : (
    // asChild: the row *is* the link, same reasoning as every other
    // link-shaped Menu.Item in this migration (see
    // OpenPublicOffering.tsx / MatrixChatHeader.tsx).
    <Menu.Item asChild>
      <a href={row.payment_url} target="_self" rel="noopener noreferrer">
        {/* Menu.Item renders no icon/label slots under asChild, so they
            are written out here, marked as MenuItem marks its own. */}
        <span
          data-slot="menu-item-icon"
          className="inline-flex shrink-0 items-center justify-center size-[20px] me-[12px] [&>svg]:size-[20px] leading-none"
        >
          <MoneyIcon weight="bold" />
        </span>
        <span data-slot="menu-item-label" className="flex-1 min-w-0">
          {translate('Pay')}
        </span>
      </a>
    </Menu.Item>
  );
};
