import { FC } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useFormState } from 'react-final-form';

import { translate } from '@/i18n';
import { WizardModal, WizardStepProps } from '@/wizard';

import { AudienceFields } from '../AudienceFields';
import { RecipientsList } from '../RecipientsList';
import { BroadcastFormData } from '../types';

const RecipientsListQuery = () => {
  const { values } = useFormState<BroadcastFormData>();
  return <RecipientsList query={values} />;
};

export const RecipientsStep: FC<WizardStepProps> = (props) => (
  <WizardModal {...props}>
    <Row>
      <Col
        sm={4}
        style={{
          borderRight: '2px solid #eff2f5',
          paddingRight: 20,
          marginRight: 20,
        }}
      >
        <AudienceFields
          allUsersLabel={translate('Send message to all users')}
        />
      </Col>
      <Col sm={7}>
        <RecipientsListQuery />
      </Col>
    </Row>
  </WizardModal>
);
