import { useDispatch, useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { getCustomer } from '@waldur/workspace/selectors';

const ProviderProjectResourcesDialog = lazyComponent(
  () => import('./ProviderProjectResourcesDialog'),
  'ProviderProjectResourcesDialog',
);

export const ResourcesColumn = ({ row }) => {
  const dispatch = useDispatch();
  const customer = useSelector(getCustomer);

  return (
    <button
      className="btn btn-link"
      onClick={() =>
        dispatch(
          openModalDialog(ProviderProjectResourcesDialog, {
            resolve: {
              project_uuid: row.uuid,
              provider_uuid: customer,
            },
            size: 'lg',
          }),
        )
      }
    >
      {translate('{count} resources', {
        count: row.resources_count || 0,
      })}
    </button>
  );
};
