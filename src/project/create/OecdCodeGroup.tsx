import { Field } from 'react-final-form';

import { ENV } from '@waldur/core/config';
import { required } from '@waldur/core/validators';
import { isFeatureVisible } from '@waldur/features/connect';
import { ProjectFeatures } from '@waldur/FeaturesEnums';
import { SelectField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

import { OECD_FOS_2007_CODES } from '../OECD_FOS_2007_CODES';

export const OecdCodeGroup = () => {
  const isCodeRequired = ENV.plugins.WALDUR_CORE.OECD_FOS_2007_CODE_MANDATORY;
  return isFeatureVisible(ProjectFeatures.oecd_fos_2007_code) ? (
    <FormGroup
      label={translate('OECD FoS code')}
      help={translate('Choose a science code identifying project activities.')}
      required={isCodeRequired}
    >
      <Field
        component={SelectField}
        name="oecd_fos_2007_code"
        options={OECD_FOS_2007_CODES}
        getOptionValue={(option) => option.value}
        getOptionLabel={(option) => `${option.value}. ${option.label}`}
        isClearable={true}
        validate={isCodeRequired ? required : undefined}
      />
    </FormGroup>
  ) : null;
};
