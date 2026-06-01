import { FC, useMemo } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useFormState } from 'react-final-form';

import { AsyncSelectGroup, BooleanGroup } from '@/form';
import { translate } from '@/i18n';
import {
  organizationAutocomplete,
  providerOfferingsAutocomplete,
} from '@/marketplace/common/autocompletes';
import { WizardModal, WizardStepProps } from '@/wizard';

import { RecipientsList } from '../RecipientsList';
import { BroadcastFormData } from '../types';

const RecipientsListQuery = () => {
  const { values } = useFormState<BroadcastFormData>();
  return <RecipientsList query={values} />;
};

export const RecipientsStep: FC<WizardStepProps> = (props) => {
  const loadOptions = useMemo(
    () => providerOfferingsAutocomplete({ shared: true }),
    [],
  );
  const loadOrganizations = useMemo(
    () =>
      organizationAutocomplete({
        field: ['name', 'uuid'],
        o: 'name',
      }),
    [],
  );
  return (
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
          <BooleanGroup
            name="all_users"
            label={translate('Send message to all users')}
            hideLabel={true}
          />

          <AsyncSelectGroup
            label={translate('Offerings')}
            description={translate('Select specific offerings to target')}
            name="offerings"
            placeholder={translate('Select offerings...')}
            loadOptions={loadOptions}
            getOptionLabel={(option) => option.name}
            getOptionValue={(option) => option.uuid}
            noOptionsMessage={() => translate('No offerings found')}
            isMulti={true}
          />

          <AsyncSelectGroup
            label={translate('Organizations')}
            description={translate('Select specific organizations to target')}
            name="customers"
            placeholder={translate('Select organizations...')}
            loadOptions={loadOrganizations}
            getOptionLabel={(option) => option.name}
            getOptionValue={(option) => option.uuid}
            noOptionsMessage={() => translate('No organizations found')}
            isMulti={true}
          />
        </Col>
        <Col sm={7}>
          <RecipientsListQuery />
        </Col>
      </Row>
    </WizardModal>
  );
};
