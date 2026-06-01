import { isFeatureVisible } from '@/features/connect';
import { ProjectFeatures } from '@/FeaturesEnums';
import { BooleanGroup } from '@/form';
import { translate } from '@/i18n';

export const IndustryGroup = () =>
  isFeatureVisible(ProjectFeatures.show_industry_flag) ? (
    <BooleanGroup
      name="is_industry"
      label={translate('Please mark if project is aimed at industrial use')}
    />
  ) : null;
