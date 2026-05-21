import { FC } from 'react';
import { Field, useForm, useFormState } from 'react-final-form';

import { required } from '@/core/validators';
import { translate } from '@/i18n';
import { BoxRadioField } from '@/marketplace/deploy/steps/BoxRadioField';

import { ProjectImportFormData } from './types';

const choices = [
  {
    label: translate('Projects only'),
    value: 'projects_only',
    metadata: translate(
      'Import just project details without associated resources. Includes basic project metadata.',
    ),
  },
  {
    label: translate('Projects with resources'),
    value: 'projects_with_resources',
    metadata: translate(
      'Import projects along with their associated resources based on a selected offering type.',
    ),
  },
];

export const Step1ImportType: FC = () => {
  const form = useForm<ProjectImportFormData>();
  const { values } = useFormState<ProjectImportFormData>();

  return (
    <Field
      name="import_type"
      validate={required}
      render={({ input }) => (
        <BoxRadioField
          input={
            {
              ...input,
              onChange: (value) => {
                input.onChange(value);
                if (value !== values?.import_type) {
                  form.change('file', null);
                }
                if (value === 'projects_only') {
                  form.change('offering', null);
                }
              },
            } as any
          }
          choices={choices}
          vertical
          hasOptions={false}
          hasImage={false}
          leftRadio
        />
      )}
    />
  );
};
