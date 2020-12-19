import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';

export const DownloadInvoiceButton: FunctionComponent<{ invoice }> = ({
  invoice,
}) => (
  <a
    className="btn btn-primary"
    download={`invoice-${invoice.number}.pdf`}
    href={invoice.pdf}
    target="_self"
  >
    <i className="fa fa-download" /> {translate('Download invoice')}
  </a>
);
