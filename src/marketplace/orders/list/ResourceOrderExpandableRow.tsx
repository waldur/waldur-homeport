import { OrderDetails } from 'waldur-js-client';

import { FileDownloader } from '@/form/upload/FileDownloader';
import { translate } from '@/i18n';
import { Field } from '@/resource/summary';
import { ExpandableContainer } from '@/table/ExpandableContainer';

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
