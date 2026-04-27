import { Field } from 'react-final-form';

import { ENV } from '@/core/config';
import { required } from '@/core/validators';
import { isFeatureVisible } from '@/features/connect';
import { ProjectFeatures } from '@/FeaturesEnums';
import { SelectField } from '@/form';
import { translate } from '@/i18n';
import { FormGroup } from '@/marketplace/offerings/FormGroup';

import { projectKindOptions } from '../utils';

export const KindGroup = ({ create }: { create?: boolean }) => {
  const kindOptions = Object.values(projectKindOptions());
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
