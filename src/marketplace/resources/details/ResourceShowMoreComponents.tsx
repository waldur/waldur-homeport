import { Resource, OfferingComponent } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

import { ResourceDisplayLimits } from '../types';

const ResourceComponentsDialog = lazyComponent(() =>
  import('./ResourceComponentsDialog').then((module) => ({
    default: module.ResourceComponentsDialog,
  })),
);

export const ResourceShowMoreComponents = ({
  resource,
  components,
  orderTypes,
  orderPeriod,
  orderPeriodHint,
}: {
  resource: Pick<
    Resource,
    'name' | 'current_usages' | 'limits' | 'limit_usage'
  > &
    Partial<Pick<Resource, 'spending_limit_status'>> &
    ResourceDisplayLimits;
  components: OfferingComponent[];
  // The whole-order view, when the grid shows it: the dialog shows the same.
  orderTypes?: string[];
  orderPeriod?: string;
  orderPeriodHint?: string;
}) => {
  const { openDialog } = useModal();

  return (
    <button
      type="button"
      className="text-anchor font-medium"
      onClick={() =>
        openDialog(ResourceComponentsDialog, {
          resolve: {
            resource,
            components,
            orderTypes,
            orderPeriod,
            orderPeriodHint,
          },
          size: 'lg',
        })
      }
    >
      {translate('Show more')}
    </button>
  );
};
