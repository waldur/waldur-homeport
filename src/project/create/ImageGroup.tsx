import { Field } from 'react-final-form';

import { isFeatureVisible } from '@/features/connect';
import { ProjectFeatures } from '@/FeaturesEnums';
import { FormGroup } from '@/form';
import { ImageField } from '@/form/ImageField';
import { translate } from '@/i18n';

export const ImageGroup = ({ create }: { create?: boolean }) =>
  !create || isFeatureVisible(ProjectFeatures.show_image_in_create_dialog) ? (
    <FormGroup label={translate('Project image')}>
      <Field component={ImageField} name="image" />
    </FormGroup>
  ) : null;
