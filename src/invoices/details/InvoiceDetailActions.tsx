import { FC } from 'react';
import { ButtonGroup } from 'react-bootstrap';

import { Invoice } from '../types';

import { DownloadInvoiceButton } from './DownloadInvoiceButton';
import { InvoicePayButton } from './InvoicePayButton';
import { PrintInvoiceButton } from './PrintInvoiceButton';

interface InvoiceDetailActionsProps {
  invoice: Invoice;
}

export const InvoiceDetailActions: FC<InvoiceDetailActionsProps> = ({
  invoice,
}) => (
  <ButtonGroup>
    {invoice?.pdf ? (
      <DownloadInvoiceButton invoice={invoice} />
    ) : (
      <PrintInvoiceButton />
    )}
    <InvoicePayButton invoice={invoice} />
  </ButtonGroup>
);
