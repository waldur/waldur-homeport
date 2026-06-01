import { ENV } from '@/core/config';
import { required } from '@/core/validators';
import { isFeatureVisible } from '@/features/connect';
import { ProjectFeatures } from '@/FeaturesEnums';
import { SelectGroup } from '@/form';
import { translate } from '@/i18n';

import { OECD_FOS_2007_CODES } from '../OECD_FOS_2007_CODES';

export const OecdCodeGroup = () => {
  const isCodeRequired = ENV.plugins.WALDUR_CORE.OECD_FOS_2007_CODE_MANDATORY;
  return isFeatureVisible(ProjectFeatures.oecd_fos_2007_code) ? (
    <SelectGroup
      name="oecd_fos_2007_code"
      options={OECD_FOS_2007_CODES}
      getOptionValue={(option) => option.value}
      getOptionLabel={(option) => `${option.value}. ${option.label}`}
      isClearable={true}
      validate={isCodeRequired ? required : undefined}
      label={translate('OECD FoS code')}
      help={translate('Choose a science code identifying project activities.')}
      required={isCodeRequired}
    />
  ) : null;
};
