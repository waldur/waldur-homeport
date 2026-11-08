import { MoneyIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import {
  buttonVariants,
  Menu,
  MenuItemIconSlot,
  MenuItemLabelSlot,
} from 'waldur-ui';

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
      className={`${buttonVariants({ variant: 'warning' })} px-1.5`}
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
        {/* Menu.Item renders no icon/label slots under asChild, so this
            row uses MenuItem's own slot components. */}
        <MenuItemIconSlot>
          <MoneyIcon weight="bold" />
        </MenuItemIconSlot>
        <MenuItemLabelSlot>{translate('Pay')}</MenuItemLabelSlot>
      </a>
    </Menu.Item>
  );
};
