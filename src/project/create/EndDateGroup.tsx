import { DateTime } from 'luxon';
import { useFormState } from 'react-final-form';

import { ENV } from '@/core/config';
import { composeValidators, endAfterStart, required } from '@/core/validators';
import { isFeatureVisible } from '@/features/connect';
import { ProjectFeatures } from '@/FeaturesEnums';
import { DateGroup } from '@/form';
import { translate } from '@/i18n';

export const EndDateGroup = ({ create }: { create?: boolean }) => {
  const { values } = useFormState({ subscription: { values: true } });
  const tomorrow = DateTime.now().plus({ days: 1 }).toISODate();
  const startDate = values?.start_date;
  const isMandatoryFromBackend =
    !!ENV.plugins?.WALDUR_CORE?.PROJECT_END_DATE_MANDATORY;

  return !create ||
    isFeatureVisible(ProjectFeatures.show_end_date_in_create_dialog) ||
    isMandatoryFromBackend ? (
    <DateGroup
      name="end_date"
      minDate={startDate && startDate > tomorrow ? startDate : tomorrow}
      containerClassName="col-lg"
      validate={
        isMandatoryFromBackend
          ? composeValidators(required, endAfterStart)
          : endAfterStart
      }
      label={translate('End date')}
      help={translate(
        'The date is inclusive. Once reached (plus any configured grace period), all project resources will be scheduled for termination.',
      )}
      required={isMandatoryFromBackend}
    />
  ) : null;
};
