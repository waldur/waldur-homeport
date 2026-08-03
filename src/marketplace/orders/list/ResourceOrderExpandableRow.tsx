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

    {/* Without this the row expands to an empty box on exactly the orders
        someone opens it for, and the reason is only reachable by navigating
        into the order. Kept per-order rather than on the resource: a resource
        that failed to terminate four times has four reasons. */}
    {row.error_message ? (
      <Field label={translate('Error message')} value={row.error_message} />
    ) : null}
  </ExpandableContainer>
);
