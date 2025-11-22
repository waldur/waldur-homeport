import { OrderDetails } from 'waldur-js-client';

import { FileDownloader } from '@waldur/form/upload/FileDownloader';
import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';
import { ExpandableContainer } from '@waldur/table/ExpandableContainer';

export const ResourceOrderExpandableRow = ({ row }: { row: OrderDetails }) => (
  <ExpandableContainer asTable>
    {row.attachment ? (
      <Field
        label={translate('Purchase order')}
        value={
          <FileDownloader url={row.attachment} name={translate('PDF file')} />
        }
      />
    ) : null}

    {row.request_comment ? (
      <Field label={translate('PO reference')} value={row.request_comment} />
    ) : null}
  </ExpandableContainer>
);
