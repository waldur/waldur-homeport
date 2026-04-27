import { Field } from 'react-final-form';

import { validateMaxLength } from '@/core/validators';
import { isFeatureVisible } from '@/features/connect';
import { ProjectFeatures } from '@/FeaturesEnums';
import { TextField } from '@/form';
import { translate } from '@/i18n';
import { FormGroup } from '@/marketplace/offerings/FormGroup';

export const DescriptionGroup = ({ create }: { create?: boolean }) =>
  !create ||
  isFeatureVisible(ProjectFeatures.show_description_in_create_dialog) ? (
    <FormGroup
      label={translate('Project description')}
      controlId="project-description"
    >
      <Field
        component={TextField as any}
        name="description"
        placeholder={translate('Enter a description...')}
        validate={validateMaxLength(4096)}
      />
    </FormGroup>
  ) : null;
