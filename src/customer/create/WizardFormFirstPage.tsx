import * as React from 'react';
import PanelBody from 'react-bootstrap/lib/PanelBody';

import { ENV } from '@waldur/core/services';
import { LATIN_NAME_PATTERN } from '@waldur/core/utils';
import { InputField } from '@waldur/form/InputField';
import { translate } from '@waldur/i18n';

import { DomainGroup } from './DomainGroup';
import { ImageFileField } from './ImageFileField';
import { InputGroup } from './InputGroup';
import { SelectField } from './SelectField';
import { WizardForm } from './WizardForm';

const formatCompanyTypes = (ENV) =>
  (ENV.plugins.WALDUR_CORE.COMPANY_TYPES || []).map((item) => ({
    value: item,
    label: item,
  }));

export const WizardFormFirstPage = (props) => (
  <WizardForm {...props}>
    <PanelBody>
      <InputGroup
        name="name"
        component={InputField}
        required={true}
        label={translate('Name')}
        maxLength={150}
        helpText={translate('Name of your organization.')}
        pattern={ENV.enforceLatinName && LATIN_NAME_PATTERN.source}
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
          options={formatCompanyTypes(ENV)}
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
