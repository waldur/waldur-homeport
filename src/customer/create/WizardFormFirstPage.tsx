import { FunctionComponent } from 'react';
import { PanelBody } from 'react-bootstrap';

import { ENV } from '@waldur/configs/default';
import { getNameFieldValidators } from '@waldur/core/validators';
import { InputField } from '@waldur/form/InputField';
import { translate } from '@waldur/i18n';

import { DomainGroup } from './DomainGroup';
import { ImageFileField } from './ImageFileField';
import { InputGroup } from './InputGroup';
import { SelectField } from './SelectField';
import { WizardForm } from './WizardForm';

const formatCompanyTypes = () =>
  (ENV.plugins.WALDUR_CORE.COMPANY_TYPES || []).map((item) => ({
    value: item,
    label: item,
  }));

export const WizardFormFirstPage: FunctionComponent<any> = (props) => (
  <WizardForm {...props}>
    <PanelBody>
      <InputGroup
        name="name"
        component={InputField}
        required={true}
        label={translate('Name')}
        maxLength={150}
        helpText={translate('Name of your organization.')}
        validate={getNameFieldValidators()}
      />
      {ENV.plugins.WALDUR_CORE.NATIVE_NAME_ENABLED === true && (
        <InputGroup
          name="native_name"
          component={InputField}
          label={translate('Native name')}
          maxLength={160}
        />
      )}
      <DomainGroup />
      {ENV.plugins.WALDUR_CORE.COMPANY_TYPES.length > 0 && (
        <InputGroup
          name="type"
          component={SelectField}
          label={translate('Organization type')}
          options={formatCompanyTypes()}
          isClearable={true}
        />
      )}
      <InputGroup
        name="email"
        component={InputField}
        type="email"
        label={translate('Contact e-mail')}
        required={true}
      />
      <InputGroup
        name="phone_number"
        component={InputField}
        type="tel"
        label={translate('Contact phone')}
      />
      <InputGroup
        name="homepage"
        component={InputField}
        label={translate('Website URL')}
        type="url"
        pattern="https?://.+"
      />
      <InputGroup
        name="image"
        component={ImageFileField}
        type="file"
        label={translate('Logo')}
      />
    </PanelBody>
  </WizardForm>
);
