import { FC } from 'react';

import { required } from '@/core/validators';
import { BooleanGroup, RadioGroup, StringGroup } from '@/form';
import { translate } from '@/i18n';
import { LikertScaleLength } from '@/marketplace-checklist/types';

const SCALE_OPTIONS: Array<{ value: LikertScaleLength; label: string }> = [
  { value: 3, label: translate('3 point') },
  { value: 5, label: translate('5 point') },
  { value: 7, label: translate('7 point') },
];

export const QuestionLikertFields: FC = () => (
  <>
    <RadioGroup
      name="likert_scale_length"
      label={translate('Scale length')}
      required
      options={SCALE_OPTIONS}
      orientation="horizontal"
      defaultValue={5}
      space={5}
    />
    <div className="row">
      <div className="col-sm-6">
        <StringGroup
          name="likert_low_label"
          placeholder={translate('Strongly disagree')}
          validate={required}
          label={translate('Low end label')}
          required
          space={5}
        />
      </div>
      <div className="col-sm-6">
        <StringGroup
          name="likert_high_label"
          placeholder={translate('Strongly agree')}
          validate={required}
          label={translate('High end label')}
          required
          space={5}
        />
      </div>
    </div>
    <BooleanGroup
      name="likert_allow_na"
      label={translate('Allow "N/A" answer')}
      space={5}
    />
  </>
);
