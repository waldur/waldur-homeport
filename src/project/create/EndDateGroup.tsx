import { DateTime } from 'luxon';
import { Field } from 'react-final-form';

import { required } from '@waldur/core/validators';
import { isFeatureVisible } from '@waldur/features/connect';
import { ProjectFeatures } from '@waldur/FeaturesEnums';
import { DateField } from '@waldur/form/DateField';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

export const EndDateGroup = ({ create }: { create?: boolean }) =>
  !create ||
  isFeatureVisible(ProjectFeatures.show_end_date_in_create_dialog) ||
  isFeatureVisible(ProjectFeatures.mandatory_end_date) ? (
    <FormGroup
      label={translate('End date')}
      description={translate(
        'The date is inclusive. Once reached, all project resource will be scheduled for termination.',
      )}
      required={isFeatureVisible(ProjectFeatures.mandatory_end_date)}
    >
      <Field
        component={DateField}
        name="end_date"
        minDate={DateTime.now().plus({ days: 1 }).toISO()}
        containerClassName="col-lg"
        validate={
          isFeatureVisible(ProjectFeatures.mandatory_end_date)
            ? required
            : undefined
        }
      />
    </FormGroup>
  ) : null;
