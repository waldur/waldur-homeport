import { FunctionComponent } from 'react';
import { rancherCatalogsDestroy } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { formatJsxTemplate, translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';

export const CatalogDeleteAction: FunctionComponent<{ row; refetch }> = ({
  row,
  refetch,
}) => {
  const deleteMutation = useManagedMutation<any, any, void>({
    mutationFn: () => rancherCatalogsDestroy({ path: { uuid: row.uuid } }),
    successMessage: translate('Catalog has been deleted.'),
    errorMessage: translate('Unable to delete catalog.'),
    refetch,
    confirmation: {
      title: translate('Delete catalog'),
      body: translate(
        'Are you sure you would like to delete Rancher catalog {catalog}?',
        { catalog: <strong>{row.name}</strong> },
        formatJsxTemplate,
      ),
      options: { forDeletion: true },
    },
  });
  if (ENV.plugins.WALDUR_RANCHER.READ_ONLY_MODE) {
    return null;
  }
  return (
    <RemovalActionItem
      title={translate('Delete')}
      action={() => deleteMutation.mutate()}
      disabled={deleteMutation.isPending}
    />
  );
};
