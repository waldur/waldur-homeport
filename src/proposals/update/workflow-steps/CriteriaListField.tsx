import { PlusCircleIcon, TrashIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Field } from 'react-final-form';
import { FieldArray } from 'react-final-form-arrays';

import { BaseButton } from '@/core/buttons/BaseButton';
import { CompactIconButton } from '@/core/buttons/IconButton';
import { StringField } from '@/form';
import { translate } from '@/i18n';

interface OwnProps {
  name: string;
}

export const CriteriaListField: FC<OwnProps> = ({ name }) => (
  <FieldArray name={name}>
    {({ fields }) => (
      <div className="d-flex flex-column gap-2">
        {fields.length === 0 && (
          <div className="text-muted small">
            {translate('No criteria defined yet.')}
          </div>
        )}
        {fields.map((fieldName, index) => (
          <div key={fieldName} className="d-flex gap-2 align-items-center">
            <div className="flex-grow-1">
              <Field
                name={`${fieldName}.name`}
                component={StringField as any}
                placeholder={translate('Criteria name (e.g., Efficiency)')}
              />
            </div>
            <CompactIconButton
              tooltip={translate('Remove')}
              iconNode={<TrashIcon weight="bold" />}
              onClick={() => fields.remove(index)}
              variant="text-danger"
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
