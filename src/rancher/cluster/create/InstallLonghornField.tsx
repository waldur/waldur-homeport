import { Field } from 'redux-form';

import { ExternalLink } from '@waldur/core/ExternalLink';
import { FormGroup } from '@waldur/form';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { translate } from '@waldur/i18n';

export const InstallLonghornField = () => (
  <Field
    name="attributes.install_longhorn"
    component={FormGroup}
    hideLabel={true}
    description={
      <ExternalLink
        label={translate(
          'Longhorn is a lightweight, reliable, and powerful distributed block storage system for Kubernetes.',
        )}
        url="https://longhorn.io/docs/"
      />
    }
  >
    <AwesomeCheckboxField
      label={translate(
        'Deploy Longhorn block storage after cluster is deployed',
      )}
    />
  </Field>
);
