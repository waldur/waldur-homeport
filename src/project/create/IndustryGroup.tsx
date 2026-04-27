import { Field } from 'react-final-form';

import { isFeatureVisible } from '@/features/connect';
import { ProjectFeatures } from '@/FeaturesEnums';
import { AwesomeCheckboxField } from '@/form/AwesomeCheckboxField';
import { translate } from '@/i18n';

export const IndustryGroup = () =>
  isFeatureVisible(ProjectFeatures.show_industry_flag) ? (
    <Field
      component={AwesomeCheckboxField as any}
      name="is_industry"
      label={translate('Please mark if project is aimed at industrial use')}
    />
  ) : null;
