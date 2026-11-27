import { FC, ReactNode } from 'react';
import { useFormState } from 'react-final-form';
import { OfferingTemplateParameter } from 'waldur-js-client';

import { Code, EmptyState } from 'waldur-ui';
import { WizardModal, WizardStepProps } from 'waldur-wizard';

import { BooleanGroup, NumberGroup, SelectGroup, StringGroup } from '@/form';
import { formatJsxTemplate, translate } from '@/i18n';

import { CreateFromTemplateFormData } from './types';
import { checkParameterValue } from './utils';

// A number field hands over text while it is being typed; the server takes
// a number, so one that parses is sent as such and the rest is checked as
// typed.
export const parseNumber = (value: unknown) => {
  if (value === '' || value === null || value === undefined) {
    return undefined;
  }
  const number = Number(value);
  return Number.isNaN(number) ? value : number;
};

const describe = (parameter: OfferingTemplateParameter): ReactNode => (
  <>
    {parameter.description}
    {parameter.pattern ? (
      <span className="block">
        {translate(
          'Format: {pattern}',
          { pattern: <Code className="text-xs">{parameter.pattern}</Code> },
          formatJsxTemplate,
        )}
      </span>
    ) : null}
  </>
);

const ParameterField: FC<{ parameter: OfferingTemplateParameter }> = ({
  parameter,
}) => {
  const common = {
    name: `parameters.${parameter.key}`,
    label: parameter.label || parameter.key,
    description: describe(parameter),
    required: parameter.required,
    validate: (value: unknown) => checkParameterValue(parameter, value),
    'data-testid': `parameter-${parameter.key}`,
  };
  if (parameter.choices?.length) {
    return (
      <SelectGroup
        {...common}
        options={parameter.choices.map((choice) => ({
          value: choice,
          label: String(choice),
        }))}
        simpleValue
        isClearable={!parameter.required}
      />
    );
  }
  switch (parameter.type) {
    case 'boolean':
      return <BooleanGroup {...common} />;
    case 'integer':
    case 'number':
      return (
        <NumberGroup
          {...common}
          parse={parseNumber}
          step={parameter.type === 'integer' ? 1 : 'any'}
        />
      );
    default:
      return <StringGroup {...common} />;
  }
};

export const ParametersStep: FC<WizardStepProps> = (props) => {
  const { values } = useFormState<CreateFromTemplateFormData>();
  const parameters = values.template?.parameters ?? [];
  return (
    <WizardModal {...props}>
      {parameters.length ? (
        parameters.map((parameter) => (
          <ParameterField key={parameter.key} parameter={parameter} />
        ))
      ) : (
        <EmptyState
          title={translate('No parameters')}
          message={translate(
            'This template asks for nothing: the offering is created as the template describes it.',
          )}
        />
      )}
    </WizardModal>
  );
};
