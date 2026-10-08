import { Col, Row } from 'react-bootstrap';
import { Resource, OfferingComponent } from 'waldur-js-client';

import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { ScopeSubtitle } from '@/modal/ScopeSubtitle';

import { ResourceComponentItem } from './ResourceComponentItem';

interface ResourceComponentsDialogProps {
  resolve: {
    resource: Pick<
      Resource,
      'name' | 'current_usages' | 'limits' | 'limit_usage'
    >;
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
        {resolve.components.map((component) => (
          <Col key={component.type} xs={12} sm={6} md={4} lg={3}>
            <ResourceComponentItem
              resource={resolve.resource as any}
              component={component}
            />
          </Col>
        ))}
      </Row>
    </ModalDialog>
  );
};
