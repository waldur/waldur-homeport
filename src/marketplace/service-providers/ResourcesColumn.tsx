import { useDispatch } from 'react-redux';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { openModalDialog } from '@/modal/actions';

const ProviderProjectResourcesDialog = lazyComponent(() =>
  import('./ProviderProjectResourcesDialog').then((module) => ({
    default: module.ProviderProjectResourcesDialog,
  })),
);

export const ResourcesColumn = ({ row, provider_customer_uuid }) => {
  const dispatch = useDispatch();

  return (
    <button
      className="btn btn-link"
      onClick={() =>
        dispatch(
          openModalDialog(ProviderProjectResourcesDialog, {
            resolve: {
              project_uuid: row.uuid,
              provider_customer_uuid,
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
