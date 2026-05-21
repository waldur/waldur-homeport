import { FC } from 'react';
import { Form } from 'react-bootstrap';
import { Field, useField } from 'react-final-form';

import { required } from '@/core/validators';
import { StringField } from '@/form';
import { AwesomeCheckboxField } from '@/form/AwesomeCheckboxField';
import { translate } from '@/i18n';
import { FormGroup } from '@/marketplace/offerings/FormGroup';
import { LikertScaleLength } from '@/marketplace-checklist/types';

const SCALE_OPTIONS: Array<{ value: LikertScaleLength; label: string }> = [
  { value: 3, label: translate('3 point') },
  { value: 5, label: translate('5 point') },
  { value: 7, label: translate('7 point') },
];

const ScaleLengthRadioField: FC = () => {
  const { input } = useField<LikertScaleLength>('likert_scale_length', {
    subscription: { value: true },
    defaultValue: 5 as LikertScaleLength,
  });
  return (
    <div className="d-flex flex-wrap gap-4">
      {SCALE_OPTIONS.map((opt) => (
        <Form.Check
          key={opt.value}
          type="radio"
          id={`likert-scale-${opt.value}`}
          name="likert_scale_length"
          checked={(input.value || 5) === opt.value}
          onChange={() => input.onChange(opt.value)}
          label={opt.label}
        />
      ))}
    </div>
  );
};

export const QuestionLikertFields: FC = () => (
  <>
    <FormGroup label={translate('Scale length')} required space={5}>
      <ScaleLengthRadioField />
    </FormGroup>
    <div className="row">
      <div className="col-sm-6">
        <FormGroup label={translate('Low end label')} required space={5}>
          <Field
            name="likert_low_label"
            component={StringField}
            placeholder={translate('Strongly disagree')}
            validate={required}
          />
        </FormGroup>
      </div>
      <div className="col-sm-6">
        <FormGroup label={translate('High end label')} required space={5}>
          <Field
            name="likert_high_label"
            component={StringField}
            placeholder={translate('Strongly agree')}
            validate={required}
          />
        </FormGroup>
      </div>
    </div>
    <FormGroup space={5}>
      <Field
        name="likert_allow_na"
        component={AwesomeCheckboxField}
        label={translate('Allow "N/A" answer')}
      />
    </FormGroup>
  </>
);
