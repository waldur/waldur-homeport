import { Col, Row } from 'react-bootstrap';
import { useMediaQuery } from 'react-responsive';

import { translate } from '@/i18n';
import { Limits } from '@/marketplace/common/types';
import { OfferingComponent } from '@/marketplace/types';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';

import { ResourceComponentItem } from './ResourceComponentItem';

interface ResourceComponentsDialogProps {
  resolve: {
    resource: { current_usages: Limits; limits: Limits; limit_usage: Limits };
    components: OfferingComponent[];
  };
}

export const ResourceComponentsDialog: React.FC<
  ResourceComponentsDialogProps
> = ({ resolve }) => {
  const isSmallScreen = useMediaQuery({ maxWidth: 320 });

  return (
    <ModalDialog
      title={translate('Components')}
      footer={<CloseDialogButton label={translate('Done')} />}
    >
      <Row>
        {resolve.components.map((component) => (
          <Col
            key={component.type}
            xs={isSmallScreen ? 12 : 6}
            sm={6}
            md={4}
            lg={3}
          >
            <ResourceComponentItem
              resource={resolve.resource}
              component={component}
            />
          </Col>
        ))}
      </Row>
    </ModalDialog>
  );
};
