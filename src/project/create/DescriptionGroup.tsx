import { validateMaxLength } from '@/core/validators';
import { isFeatureVisible } from '@/features/connect';
import { ProjectFeatures } from '@/FeaturesEnums';
import { TextGroup } from '@/form';
import { translate } from '@/i18n';

export const DescriptionGroup = ({ create }: { create?: boolean }) =>
  !create ||
  isFeatureVisible(ProjectFeatures.show_description_in_create_dialog) ? (
    <TextGroup
      name="description"
      placeholder={translate('Enter a description...')}
      validate={validateMaxLength(4096)}
      label={translate('Project description')}
      controlId="project-description"
    />
  ) : null;
