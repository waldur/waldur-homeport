import { FunctionComponent } from 'react';
import { PanelBody } from 'react-bootstrap';

import { InputField } from '@waldur/form/InputField';
import { translate } from '@waldur/i18n';

import { CountryGroup } from './CountryGroup';
import { InputGroup } from './InputGroup';
import { WizardForm } from './WizardForm';

export const WizardFormSecondPage: FunctionComponent<any> = (props) => (
  <WizardForm {...props}>
    <PanelBody>
      <InputGroup
        name="registration_code"
        component={InputField}
        label={translate('Organization registration code')}
        maxLength={150}
        required={true}
        helpText={translate(
          'Please provide registration code of your company.',
        )}
      />
      <CountryGroup />
      <InputGroup
        name="address"
        label={translate('Address')}
        component={InputField}
        required={true}
        maxLength={300}
      />
      <InputGroup
        name="postal"
        label={translate('Postal code')}
        component={InputField}
        maxLength={20}
      />
      <InputGroup
        name="bank_name"
        label={translate('Bank name')}
        component={InputField}
        maxLength={150}
      />
      <InputGroup
        name="bank_account"
        label={translate('Bank account')}
        component={InputField}
        maxLength={50}
      />
      <InputGroup
        name="vat_code"
        label={translate('EU VAT ID')}
        component={InputField}
        help_text={translate(
          'Please provide your EU VAT ID if you are registered in the European Union.',
        )}
      />
    </PanelBody>
  </WizardForm>
);
