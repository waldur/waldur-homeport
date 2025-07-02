import { FC } from 'react';

import { FilteredEventsButton } from '@waldur/events/FilteredEventsButton';

import { Invoice } from '../types';

import { InvoicePayButton } from './InvoicePayButton';
import { PrintInvoiceButton } from './PrintInvoiceButton';

interface InvoiceDetailActionsProps {
  invoice: Invoice;
}

export const InvoiceDetailActions: FC<InvoiceDetailActionsProps> = ({
  invoice,
}) => (
  <>
    <PrintInvoiceButton />
    <FilteredEventsButton
      filter={{ scope: invoice.url, feature: 'invoices' }}
    />

    <InvoicePayButton row={invoice} asButton />
  </>
);
