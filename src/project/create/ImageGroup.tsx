import { isFeatureVisible } from '@/features/connect';
import { ProjectFeatures } from '@/FeaturesEnums';
import { ImageGroup as FormImageGroup } from '@/form';
import { translate } from '@/i18n';

export const ImageGroup = ({ create }: { create?: boolean }) =>
  !create || isFeatureVisible(ProjectFeatures.show_image_in_create_dialog) ? (
    <FormImageGroup name="image" label={translate('Project image')} />
  ) : null;
