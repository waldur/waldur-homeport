import { FC } from 'react';
import { Col, Row } from 'react-bootstrap';
import { Field } from 'react-final-form';

import { StringField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { Field as SummaryField } from '@waldur/resource/summary';
import { WizardModal, WizardStepProps } from '@waldur/wizard';

export const Step3PurchaseOrder: FC<WizardStepProps> = (props) => {
  const resources = props.data?.resources;
  const resource = resources?.[0];
  const isMulti = resources && resources.length > 1;

  // Build resource identifier string
  const resourceIdentifier = [resource.slug, resource.backend_id, resource.uuid]
    .filter(Boolean)
    .join(' / ');

  // Build department to invoice string
  const departmentToInvoice = [resource.customer_name, resource.project_name]
    .filter(Boolean)
    .join(' / ');

  return (
    <WizardModal {...props}>
      {/* Show resource info when invoked from pending actions (single resource only) */}
      {!isMulti && (
        <div className="mb-6">
          <SummaryField
            label={translate('Resource')}
            value={resourceIdentifier}
            labelCol={4}
            valueCol={8}
            className="mb-3"
          />
          <SummaryField
            label={translate('Customer organization and project')}
            value={departmentToInvoice}
            labelCol={4}
            valueCol={8}
            className="mb-3"
          />
          <hr className="mb-4" />
        </div>
      )}

      <FormGroup
        label={translate('Purchase order reference')}
        description={translate(
          'Enter the PO number or name required by your organization to renew this subscription.',
        )}
      >
        <Row>
          <Col sm={6} md={5} lg={4}>
            <Field
              name="purchase_order_reference"
              component={StringField as any}
            />
          </Col>
        </Row>
      </FormGroup>
    </WizardModal>
  );
};
