import { DateTime } from 'luxon';
import { Field } from 'react-final-form';

import { ENV } from '@waldur/core/config';
import { required } from '@waldur/core/validators';
import { isFeatureVisible } from '@waldur/features/connect';
import { ProjectFeatures } from '@waldur/FeaturesEnums';
import { DateField } from '@waldur/form/DateField';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

export const EndDateGroup = ({ create }: { create?: boolean }) => {
  const isMandatoryFromBackend =
    !!ENV.plugins?.WALDUR_CORE?.PROJECT_END_DATE_MANDATORY;

  return !create ||
    isFeatureVisible(ProjectFeatures.show_end_date_in_create_dialog) ||
    isMandatoryFromBackend ? (
    <FormGroup
      label={translate('End date')}
      help={translate(
        'The date is inclusive. Once reached (plus any configured grace period), all project resources will be scheduled for termination.',
      )}
      required={isMandatoryFromBackend}
    >
      <Field
        component={DateField}
        name="end_date"
        minDate={DateTime.now().plus({ days: 1 }).toISO()}
        containerClassName="col-lg"
        validate={isMandatoryFromBackend ? required : undefined}
      />
    </FormGroup>
  ) : null;
};
