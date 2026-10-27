import { PlusCircleIcon, TrashIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Field } from 'react-final-form';
import { FieldArray } from 'react-final-form-arrays';

import { BaseButton } from 'waldur-ui';

import { StringField } from '@/form';
import { translate } from '@/i18n';

interface OwnProps {
  name: string;
}

export const CriteriaListField: FC<OwnProps> = ({ name }) => (
  <FieldArray name={name}>
    {({ fields }) => (
      <div className="flex flex-col gap-1.5">
        {fields.length === 0 && (
          <div className="text-quaternary small">
            {translate('No criteria defined yet.')}
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
                    placeholder={translate('Criteria name (e.g., Efficiency)')}
                  />
                )}
              />
            </div>
            <BaseButton
              tooltip={translate('Remove')}
              iconNode={<TrashIcon weight="bold" />}
              onClick={() => fields.remove(index)}
              variant="text-danger"
              size="sm"
            />
          </div>
        ))}
        <div>
          <BaseButton
            type="button"
            variant="text-primary"
            size="sm"
            iconNode={<PlusCircleIcon weight="bold" />}
            label={translate('Add criteria')}
            onClick={() => fields.push({ name: '', order: fields.length })}
          />
        </div>
      </div>
    )}
  </FieldArray>
);
