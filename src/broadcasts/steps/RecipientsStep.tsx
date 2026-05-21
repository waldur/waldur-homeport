import { FC } from 'react';
import { Col, Row } from 'react-bootstrap';
import { Field, useFormState } from 'react-final-form';

import { Select } from '@/form/AsyncSelectField';
import { AwesomeCheckboxField } from '@/form/AwesomeCheckboxField';
import { translate } from '@/i18n';
import {
  organizationAutocomplete,
  providerOfferingsAutocomplete,
} from '@/marketplace/common/autocompletes';
import { FormGroup } from '@/marketplace/offerings/FormGroup';
import { WizardModal, WizardStepProps } from '@/wizard';

import { RecipientsList } from '../RecipientsList';
import { BroadcastFormData } from '../types';

const RecipientsListQuery = () => {
  const { values } = useFormState<BroadcastFormData>();
  return <RecipientsList query={values} />;
};

export const RecipientsStep: FC<WizardStepProps> = (props) => {
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
          <FormGroup>
            <Field
              name="all_users"
              component={AwesomeCheckboxField}
              label={translate('Send message to all users')}
              hideLabel={true}
            />
          </FormGroup>

          <FormGroup
            label={translate('Offerings')}
            description={translate('Select specific offerings to target')}
          >
            <Field
              name="offerings"
              component={Select}
              placeholder={translate('Select offerings...')}
              loadOptions={(query, prevOptions, page) =>
                providerOfferingsAutocomplete(
                  { name: query, shared: true },
                  prevOptions,
                  page,
                )
              }
              getOptionLabel={(option) => option.name}
              getOptionValue={(option) => option.uuid}
              noOptionsMessage={() => translate('No offerings found')}
              isMulti={true}
            />
          </FormGroup>

          <FormGroup
            label={translate('Organizations')}
            description={translate('Select specific organizations to target')}
          >
            <Field
              name="customers"
              component={Select}
              placeholder={translate('Select organizations...')}
              loadOptions={(query, prevOptions, page) =>
                organizationAutocomplete(query, prevOptions, page, {
                  field: ['name', 'uuid'],
                  o: 'name',
                })
              }
              getOptionLabel={(option) => option.name}
              getOptionValue={(option) => option.uuid}
              noOptionsMessage={() => translate('No organizations found')}
              isMulti={true}
            />
          </FormGroup>
        </Col>
        <Col sm={7}>
          <RecipientsListQuery />
        </Col>
      </Row>
    </WizardModal>
  );
};
