import { DateTime } from 'luxon';

import { required } from '@/core/validators';
import { isFeatureVisible } from '@/features/connect';
import { ProjectFeatures } from '@/FeaturesEnums';
import { DateGroup } from '@/form';
import { translate } from '@/i18n';

export const StartDateGroup = ({ create }: { create?: boolean }) =>
  !create ||
  isFeatureVisible(ProjectFeatures.show_start_date_in_create_dialog) ||
  isFeatureVisible(ProjectFeatures.mandatory_start_date) ? (
    <DateGroup
      name="start_date"
      minDate={DateTime.now().toISO()}
      containerClassName="col-lg"
      validate={
        isFeatureVisible(ProjectFeatures.mandatory_start_date)
          ? required
          : undefined
      }
      label={translate('Start date')}
      help={translate(
        'Once start date is reached, invitations and orders are processed.',
      )}
      required={isFeatureVisible(ProjectFeatures.mandatory_start_date)}
    />
  ) : null;
