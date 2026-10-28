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
  };
}

export const ResourceComponentsDialog: React.FC<
  ResourceComponentsDialogProps
> = ({ resolve }) => {
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
              />
            </div>
          ),
        )}
      </div>
    </ModalDialog>
  );
};
