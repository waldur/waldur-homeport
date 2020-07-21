import * as constants from '../constants';

export const markInvoiceAsPaid = (formData, invoiceUuid: string) => ({
  type: constants.MARK_INVOICE_AS_PAID,
  payload: { formData, invoiceUuid },
});
