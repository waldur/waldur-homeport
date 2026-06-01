import { DateTime } from 'luxon';

import { ENV } from '@/core/config';
import { required } from '@/core/validators';
import { isFeatureVisible } from '@/features/connect';
import { ProjectFeatures } from '@/FeaturesEnums';
import { DateGroup } from '@/form';
import { translate } from '@/i18n';

export const EndDateGroup = ({ create }: { create?: boolean }) => {
  const isMandatoryFromBackend =
    !!ENV.plugins?.WALDUR_CORE?.PROJECT_END_DATE_MANDATORY;

  return !create ||
    isFeatureVisible(ProjectFeatures.show_end_date_in_create_dialog) ||
    isMandatoryFromBackend ? (
    <DateGroup
      name="end_date"
      minDate={DateTime.now().plus({ days: 1 }).toISO()}
      containerClassName="col-lg"
      validate={isMandatoryFromBackend ? required : undefined}
      label={translate('End date')}
      help={translate(
        'The date is inclusive. Once reached (plus any configured grace period), all project resources will be scheduled for termination.',
      )}
      required={isMandatoryFromBackend}
    />
  ) : null;
};
