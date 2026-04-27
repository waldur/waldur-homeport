import { TrashIcon } from '@phosphor-icons/react';
import { FunctionComponent, useState } from 'react';
import { useDispatch } from 'react-redux';
import { rancherCatalogsDestroy } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { formatJsxTemplate, translate } from '@/i18n';
import { waitForConfirmation } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { showSuccess, showErrorResponse } from '@/store/notify';

export const CatalogDeleteAction: FunctionComponent<{ row; refetch }> = ({
  row,
  refetch,
}) => {
  const [removing, setRemoving] = useState(false);
  const dispatch = useDispatch();

  const callback = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Delete catalog'),
        translate(
          'Are you sure you would like to delete Rancher catalog {catalog}?',
          { catalog: <strong>{row.name}</strong> },
          formatJsxTemplate,
        ),
        { forDeletion: true },
      );
    } catch {
      return;
    }
    try {
      setRemoving(true);
      await rancherCatalogsDestroy({ path: { uuid: row.uuid } });
      await refetch();
      dispatch(showSuccess(translate('Catalog has been deleted.')));
    } catch (e) {
      dispatch(showErrorResponse(e, translate('Unable to delete catalog.')));
    }
    setRemoving(false);
  };
  if (ENV.plugins.WALDUR_RANCHER.READ_ONLY_MODE) {
    return null;
  }
  return (
    <ActionItem
      title={translate('Delete')}
      action={callback}
      iconNode={<TrashIcon weight="bold" />}
      className="text-danger"
      disabled={removing}
    />
  );
};
