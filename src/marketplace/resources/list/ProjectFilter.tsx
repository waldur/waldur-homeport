import { FactoryIcon } from '@phosphor-icons/react';
import { FieldValidator } from 'final-form';
import React, { useCallback } from 'react';
import { Field } from 'react-final-form';
import { Props as SelectProps } from 'react-select';

import { isFeatureVisible } from '@/features/connect';
import { ProjectFeatures } from '@/FeaturesEnums';
import { AsyncPaginate } from '@/form/themed-select';
import { translate } from '@/i18n';
import { projectAutocomplete } from '@/marketplace/common/autocompletes';

interface ProjectFilterProps {
  customer_uuid?: string;
  placeholder?: string;
  isDisabled?: boolean;
  reactSelectProps?: Partial<SelectProps>;
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
  const renderField = useCallback(
    (fieldProps) => (
      <AsyncPaginate
        placeholder={placeholder || translate('Select project...')}
        loadOptions={(query, prevOptions, { page }) =>
          projectAutocomplete(customer_uuid, query, prevOptions, page)
        }
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
