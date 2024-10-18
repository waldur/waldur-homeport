import { Row, Col } from 'react-bootstrap';
import { useMediaQuery } from 'react-responsive';

import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';

import { ComponentItem } from './AggregateLimitWidget';
import { Component } from './types';

interface AllComponentsDialogProps {
  resolve: {
    components: Component[];
  };
}

export const AllComponentsDialog: React.FC<AllComponentsDialogProps> = ({
  resolve,
}) => {
  const isSmallScreen = useMediaQuery({ maxWidth: 320 });

  return (
    <ModalDialog
      title={translate('Components')}
      footer={<CloseDialogButton label={translate('Close')} />}
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
            <ComponentItem component={component} />
          </Col>
        ))}
      </Row>
    </ModalDialog>
  );
};
