import { Resource, OfferingComponent } from 'waldur-js-client';

import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { ScopeSubtitle } from '@/modal/ScopeSubtitle';

import { ResourceDisplayLimits } from '../types';

import {
  getResourceComponentEntries,
  ResourceComponentItem,
} from './ResourceComponentItem';

interface ResourceComponentsDialogProps {
  resolve: {
    resource: Pick<
      Resource,
      'name' | 'current_usages' | 'limits' | 'limit_usage'
    > &
      Partial<Pick<Resource, 'spending_limit_status'>> &
      ResourceDisplayLimits;
    components: OfferingComponent[];
    // Components shown for the whole order, as on the grid it opens from.
    orderTypes?: string[];
    orderPeriod?: string;
    orderPeriodHint?: string;
  };
}

export const ResourceComponentsDialog: React.FC<
  ResourceComponentsDialogProps
> = ({ resolve }) => {
  const periodProps = (type: string) =>
    resolve.orderTypes?.includes(type)
      ? {
          orderPeriod: resolve.orderPeriod,
          orderPeriodHint: resolve.orderPeriodHint,
        }
      : {};
  return (
    <ModalDialog
      title={translate('Components')}
      subtitle={
        <ScopeSubtitle
          label={translate('Resource name')}
          name={resolve.resource?.name}
        />
      }
      footer={<CloseDialogButton label={translate('Done')} />}
    >
      {resolve.orderTypes?.length > 0 && resolve.orderPeriod && (
        // The cells carry the period only in their tooltip.
        <p className="text-secondary text-sm mb-3">
          {translate('Whole order')}:{' '}
          {[resolve.orderPeriod, resolve.orderPeriodHint]
            .filter(Boolean)
            .join(' · ')}
        </p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5">
        {getResourceComponentEntries(resolve.resource, resolve.components).map(
          (entry) => (
            <div key={entry.key}>
              <ResourceComponentItem
                resource={resolve.resource as any}
                component={entry.component}
                spendingLimit={entry.spendingLimit}
                thisMonth={entry.thisMonth}
                noUsageThisMonth={entry.noUsageThisMonth}
                {...periodProps(entry.component.type)}
              />
            </div>
          ),
        )}
      </div>
    </ModalDialog>
  );
};
