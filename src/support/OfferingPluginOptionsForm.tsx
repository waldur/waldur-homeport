import { FunctionComponent } from 'react';
import { Col, FormGroup, Row } from 'react-bootstrap';

import { FormContainer } from '@waldur/form';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { translate } from '@waldur/i18n';

export const OfferingPluginOptionsForm: FunctionComponent<{ container }> = ({
  container,
}) => {
  return (
    <FormContainer {...container}>
      <FormGroup>
        <Col sm={2}></Col>
        <Row>
          <Col sm={8}>
            <AwesomeCheckboxField
              name="auto_approve_in_service_provider_projects"
              label={translate('Auto approve in service provider projects')}
              hideLabel={true}
            />
          </Col>
        </Row>
      </FormGroup>
    </FormContainer>
  );
};
