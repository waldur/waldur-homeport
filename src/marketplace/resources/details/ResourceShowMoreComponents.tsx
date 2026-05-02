import { Resource } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { OfferingComponent } from '@/marketplace/types';
import { useModal } from '@/modal/actions';

const ResourceComponentsDialog = lazyComponent(() =>
  import('./ResourceComponentsDialog').then((module) => ({
    default: module.ResourceComponentsDialog,
  })),
);

export const ResourceShowMoreComponents = ({
  resource,
  components,
}: {
  resource: Pick<Resource, 'current_usages' | 'limits' | 'limit_usage'>;
  components: OfferingComponent[];
}) => {
  const { openDialog } = useModal();

  return (
    <button
      type="button"
      className="text-anchor fw-bold"
      onClick={() =>
        openDialog(ResourceComponentsDialog, {
          resolve: { resource, components },
          size: 'lg',
        })
      }
    >
      {translate('Show more')}
    </button>
  );
};
