import { TrashIcon } from '@phosphor-icons/react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { invoiceItemsDestroy } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { ActionButton } from '@waldur/table/ActionButton';
import { getUser } from '@waldur/workspace/selectors';

import { InvoiceTableItem } from '../types';

export const InvoiceItemsBulkDelete = ({
  rows,
  refetch,
}: {
  rows: InvoiceTableItem[];
  refetch(): void;
}) => {
  const user = useSelector(getUser);
  if (!user.is_staff) {
    return null;
  }

  const [isDeleting, setIsDeleting] = useState(false);
  const dispatch = useDispatch();

  const allItems = rows.flatMap((row) => row.items);

  const callback = async () => {
    try {
      const itemList = allItems.map((item) => (
        <li key={item.uuid}>{item.name}</li>
      ));

      await waitForConfirmation(
        dispatch,
        translate('Remove invoice items'),
        <div>
          <p>
            {translate(
              'Are you sure you want to remove {count} invoice item(s)?',
              { count: allItems.length },
            )}
          </p>
          <ul>{itemList}</ul>
        </div>,
        { forDeletion: true },
      );
    } catch {
      return;
    }
    try {
      setIsDeleting(true);
      for (const item of allItems) {
        try {
          await invoiceItemsDestroy({ path: { uuid: item.uuid } });
        } catch (e) {
          dispatch(
            showErrorResponse(
              e,
              translate('Unable to delete invoice item {name}.', {
                name: item.name,
              }),
            ),
          );
        }
      }
      await refetch();
      dispatch(showSuccess(translate('Invoice items have been removed.')));
    } catch (e) {
      dispatch(
        showErrorResponse(e, translate('Unable to delete invoice items.')),
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <ActionButton
      title={translate('Remove')}
      action={callback}
      iconNode={<TrashIcon weight="bold" />}
      variant="danger"
      disabled={isDeleting}
    />
  );
};
