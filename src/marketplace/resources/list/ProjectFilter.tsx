import { FactoryIcon } from '@phosphor-icons/react';
import { FieldValidator } from 'final-form';
import React, { useCallback, useMemo } from 'react';
import { Field } from 'react-final-form';

import { isFeatureVisible } from '@/features/connect';
import { ProjectFeatures } from '@/FeaturesEnums';
import { AsyncSelect } from '@/form/select';
import { translate } from '@/i18n';
import { projectAutocomplete } from '@/marketplace/common/autocompletes';

interface ProjectFilterProps {
  customer_uuid?: string;
  placeholder?: string;
  isDisabled?: boolean;
  reactSelectProps?: any;
  validator?: FieldValidator<any>;
}

const getOptionLabel = (option) => (
  <div>
    {option.name}
    {isFeatureVisible(ProjectFeatures.show_industry_flag) &&
      option.is_industry && (
        <span className="svg-icon svg-icon-3 ms-3">
          <FactoryIcon weight="bold" />
        </span>
      )}
  </div>
);

const getOptionValue = (option) => option.uuid;
const noOptionsMessage = () => translate('No projects');

export const ProjectFilter: React.FC<ProjectFilterProps> = (props) => {
  const { placeholder, customer_uuid, isDisabled, reactSelectProps } = props;
  const loadProjects = useMemo(
    () => projectAutocomplete(customer_uuid),
    [customer_uuid],
  );

  const renderField = useCallback(
    (fieldProps) => (
      <AsyncSelect
        placeholder={placeholder || translate('Select project...')}
        loadOptions={loadProjects}
        defaultOptions
        getOptionValue={getOptionValue}
        getOptionLabel={getOptionLabel as any}
        value={fieldProps.input.value}
        onChange={(value) => fieldProps.input.onChange(value)}
        noOptionsMessage={noOptionsMessage}
        isClearable={true}
        isDisabled={isDisabled}
        inputId="project-selector-input"
        {...reactSelectProps}
      />
    ),
    [placeholder, customer_uuid, isDisabled, reactSelectProps],
  );

  return (
    <Field name="project" validate={props.validator} component={renderField} />
  );
};
