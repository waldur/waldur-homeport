import React from 'react';
import { Field } from 'react-final-form';
import { ProposalReview } from 'waldur-js-client';

import { Panel } from '@/core/Panel';
import { FormGroup, TextField } from '@/form';
import { translate } from '@/i18n';
import { isReviewInFinalState } from '@/proposals/utils';
import { VStepperFormStepProps } from '@/wizard';

import { RateStars } from '../RateStars';

const FormSummaryStep: React.FC<VStepperFormStepProps> = (props) => {
  const { params } = props;

  const review: ProposalReview = params.reviews?.[0];
  const disabled = isReviewInFinalState(review?.state);

  return (
    <Panel title={props.title} id={props.id} cardBordered>
      <Field
        name="summary_score"
        disabled={disabled}
        component={(fieldProps) => {
          const starValue = Number(fieldProps.input.value) || 0;
          const ratingId = `rating-${fieldProps.input.name}`;

          return (
            <div className="form-group mb-7">
              <label className="form-label" htmlFor={ratingId}>
                {translate('Rate')}
              </label>
              <div className="d-flex align-items-center gap-4">
                <div id={ratingId}>
                  <RateStars
                    count={5}
                    size={20}
                    edit={!disabled}
                    isHalf={false}
                    value={starValue}
                    onChange={(value) => fieldProps.input.onChange(value)}
                  />
                </div>
                <span className="text-gray-700 mt-2">
                  {fieldProps.input.value === 1
                    ? translate('1 star')
                    : translate('{count} stars', {
                        count: fieldProps.input.value,
                      })}
                </span>
              </div>
            </div>
          );
        }}
      />

      <Field
        name="summary_public_comment"
        component={FormGroup}
        maxLength={1000}
        label={translate('Comments')}
        placeholder={translate('Add your comment here')}
        disabled={disabled}
      >
        <TextField />
      </Field>
      <Field
        name="summary_private_comment"
        component={FormGroup}
        maxLength={1000}
        label={translate('Notes (not visible to user)')}
        placeholder={translate('Add your notes here')}
        disabled={disabled}
      >
        <TextField />
      </Field>
    </Panel>
  );
};

export default FormSummaryStep;
