import { DateTime } from 'luxon';
import { useFormState } from 'react-final-form';

import { composeValidators, startBeforeEnd, required } from '@/core/validators';
import { isFeatureVisible } from '@/features/connect';
import { ProjectFeatures } from '@/FeaturesEnums';
import { DateGroup } from '@/form';
import { translate } from '@/i18n';

export const StartDateGroup = ({ create }: { create?: boolean }) => {
  const { values } = useFormState({ subscription: { values: true } });
  return !create ||
    isFeatureVisible(ProjectFeatures.show_start_date_in_create_dialog) ||
    isFeatureVisible(ProjectFeatures.mandatory_start_date) ? (
    <DateGroup
      name="start_date"
      minDate={DateTime.now().toISO()}
      maxDate={values?.end_date || undefined}
      containerClassName="col-lg"
      validate={
        isFeatureVisible(ProjectFeatures.mandatory_start_date)
          ? composeValidators(required, startBeforeEnd)
          : startBeforeEnd
      }
      label={translate('Start date')}
      help={translate(
        'Once start date is reached, invitations and orders are processed.',
      )}
      required={isFeatureVisible(ProjectFeatures.mandatory_start_date)}
    />
  ) : null;
};
