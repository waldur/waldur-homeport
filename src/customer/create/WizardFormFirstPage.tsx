import { FunctionComponent } from 'react';
import { Card } from 'react-bootstrap';
import { useAsync } from 'react-use';

import { ENV } from '@waldur/configs/default';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { getNameFieldValidators } from '@waldur/core/validators';
import { isFeatureVisible } from '@waldur/features/connect';
import { ImageField } from '@waldur/form/ImageField';
import { InputField } from '@waldur/form/InputField';
import { translate } from '@waldur/i18n';
import { getAllOrganizationDivisions } from '@waldur/marketplace/common/api';

import { DomainGroup } from './DomainGroup';
import { InputGroup } from './InputGroup';
import { SelectField } from './SelectField';
import { WizardForm } from './WizardForm';

export const WizardFormFirstPage: FunctionComponent<any> = (props) => {
  const {
    loading,
    error,
    value: divisions,
  } = useAsync(
    () =>
      getAllOrganizationDivisions().then((items) => {
        return items.map((item) => ({
          name: item.name,
          value: item.uuid,
        }));
      }),
    [],
  );

  return (
    <WizardForm {...props}>
      <Card>
        <Card.Body>
          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <>{translate('Unable to load divisions')}</>
          ) : (
            <>
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
              {isFeatureVisible('customer.show_domain') && <DomainGroup />}
              <InputGroup
                name="division"
                component={SelectField}
                label={translate('Division')}
                required={true}
                options={divisions}
                getOptionLabel={(option) => option.name}
              />
              <InputGroup
                name="email"
                component={InputField}
                type="email"
                label={translate('Contact email')}
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
                component={ImageField}
                type="file"
                label={translate('Logo')}
                className="mt-6"
              />
            </>
          )}
        </Card.Body>
      </Card>
    </WizardForm>
  );
};
