import { Field } from 'react-final-form';

import { ENV } from '@waldur/core/config';
import { required } from '@waldur/core/validators';
import { isFeatureVisible } from '@waldur/features/connect';
import { ProjectFeatures } from '@waldur/FeaturesEnums';
import { SelectField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

import { projectKindOptions } from '../utils';

const kindOptions = Object.values(projectKindOptions);

export const KindGroup = ({ create }: { create?: boolean }) => {
  if (!ENV.plugins.WALDUR_CORE.ENABLE_PROJECT_KIND_COURSE) {
    return null;
  }

  if (create && !isFeatureVisible(ProjectFeatures.show_kind_in_create_dialog)) {
    return null;
  }

  return (
    <FormGroup label={translate('Project kind')} required>
      <Field
        component={SelectField}
        name="kind"
        options={kindOptions}
        validate={required}
        simpleValue
      />
    </FormGroup>
  );
};
