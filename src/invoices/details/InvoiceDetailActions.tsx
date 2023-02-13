import { FC } from 'react';
import { ButtonGroup } from 'react-bootstrap';

import { Invoice } from '../types';

import { InvoicePayButton } from './InvoicePayButton';
import { PrintInvoiceButton } from './PrintInvoiceButton';

interface InvoiceDetailActionsProps {
  invoice: Invoice;
}

export const InvoiceDetailActions: FC<InvoiceDetailActionsProps> = ({
  invoice,
}) => (
  <ButtonGroup>
    <PrintInvoiceButton />
    <InvoicePayButton invoice={invoice} />
  </ButtonGroup>
);
