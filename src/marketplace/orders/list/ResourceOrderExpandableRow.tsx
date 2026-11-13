import { OrderDetails } from 'waldur-js-client';

import { PropertyItem } from 'waldur-ui';

import { translate } from '@/i18n';
import { NoResult } from '@/navigation/header/search/NoResult';
import { propVal } from '@/property/propertyFields';
import { ExpandableContainer } from '@/table/ExpandableContainer';

export const ResourceOrderExpandableRow = ({ row }: { row: OrderDetails }) =>
  !row.attachment && !row.request_comment && !row.error_message ? (
    <ExpandableContainer>
      <NoResult
        title={translate('No order details')}
        message={translate(
          'This order has no purchase order, reference or error message.',
        )}
        noAction
      />
    </ExpandableContainer>
  ) : (
    <ExpandableContainer asTable>
      {row.attachment ? (
        <PropertyItem
          label={translate('Purchase order')}
          value={propVal.file(row.attachment, {
            fileName: translate('PDF file'),
          })}
        />
      ) : null}

      {row.request_comment ? (
        <PropertyItem
          label={translate('PO reference')}
          value={row.request_comment}
        />
      ) : null}

      {/* Without this the row expands to an empty box on exactly the orders
        someone opens it for, and the reason is only reachable by navigating
        into the order. Kept per-order rather than on the resource: a resource
        that failed to terminate four times has four reasons. */}
      {row.error_message ? (
        <PropertyItem
          label={translate('Error message')}
          value={row.error_message}
        />
      ) : null}
    </ExpandableContainer>
  );
