import { PlusCircleIcon, TrashIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Field } from 'react-final-form';
import { FieldArray } from 'react-final-form-arrays';

import { BaseButton } from 'waldur-ui';

import { NumberField, StringField } from '@/form';
import { translate } from '@/i18n';
import {
  criterionLabel,
  criterionShare,
  hasUnequalWeights,
  WeightedCriterion,
} from '@/proposals/review/criteriaScore';

interface CriterionRow extends WeightedCriterion {
  order?: number;
}

interface OwnProps {
  name: string;
  /**
   * Reviewers have scored the criteria: their names and weights stand as the
   * reviewers saw them.
   */
  locked?: boolean;
}

export const CriteriaListField: FC<OwnProps> = ({ name, locked }) => (
  <FieldArray<CriterionRow> name={name}>
    {({ fields }) => {
      const criteria = fields.value ?? [];
      const weighted = hasUnequalWeights(criteria);
      if (locked) {
        return (
          <div className="flex flex-col gap-1.5">
            <ul className="mb-0 ps-5">
              {criteria.map((criterion) => (
                <li key={criterion.name}>
                  {criterionLabel(criterion, criteria)}
                </li>
              ))}
            </ul>
            <div className="text-quaternary small">
              {translate(
                'Reviewers have scored these criteria: they can no longer be changed.',
              )}
            </div>
          </div>
        );
      }
      return (
        <div className="flex flex-col gap-1.5">
          {fields.length === 0 ? (
            <div className="text-quaternary small">
              {translate('No criteria defined yet.')}
            </div>
          ) : (
            <div className="flex gap-1.5 text-quaternary small">
              <span className="grow">{translate('Criterion')}</span>
              <span className="w-24">{translate('Weight')}</span>
              {weighted && <span className="w-12">{translate('Share')}</span>}
              {/* Under the remove button. */}
              <span className="w-8" />
            </div>
          )}
          {fields.map((fieldName, index) => (
            <div key={fieldName} className="flex gap-1.5 items-center">
              <div className="grow">
                <Field
                  name={`${fieldName}.name`}
                  render={({ input, meta }) => (
                    <StringField
                      input={input}
                      meta={meta}
                      placeholder={translate(
                        'Criteria name (e.g., Efficiency)',
                      )}
                    />
                  )}
                />
              </div>
              <div className="w-24">
                <Field
                  name={`${fieldName}.weight`}
                  render={({ input, meta }) => (
                    <NumberField
                      input={input}
                      meta={meta}
                      min={1}
                      max={100}
                      step={1}
                      placeholder="1"
                    />
                  )}
                />
              </div>
              {weighted && (
                <span className="w-12 text-secondary">
                  {criterionShare(criteria[index], criteria)}%
                </span>
              )}
              <BaseButton
                tooltip={translate('Remove')}
                iconNode={<TrashIcon weight="bold" />}
                onClick={() => fields.remove(index)}
                variant="text-danger"
                size="sm"
              />
            </div>
          ))}
          {fields.length > 1 && (
            <div className="text-quaternary small">
              {translate(
                "A criterion's weight sets its share of the review's overall score.",
              )}
            </div>
          )}
          <div>
            <BaseButton
              type="button"
              variant="text-primary"
              size="sm"
              iconNode={<PlusCircleIcon weight="bold" />}
              label={translate('Add criteria')}
              onClick={() =>
                fields.push({
                  name: '',
                  order: fields.length,
                  weight: 1,
                })
              }
            />
          </div>
        </div>
      );
    }}
  </FieldArray>
);
