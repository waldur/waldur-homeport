import { Col, Row } from 'react-bootstrap';
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
      <Row>
        {getResourceComponentEntries(resolve.resource, resolve.components).map(
          (entry) => (
            <Col key={entry.key} xs={12} sm={6} md={4} lg={3}>
              <ResourceComponentItem
                resource={resolve.resource as any}
                component={entry.component}
                spendingLimit={entry.spendingLimit}
                thisMonth={entry.thisMonth}
                noUsageThisMonth={entry.noUsageThisMonth}
              />
            </Col>
          ),
        )}
      </Row>
    </ModalDialog>
  );
};
