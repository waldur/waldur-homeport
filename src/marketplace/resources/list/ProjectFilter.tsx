import { FactoryIcon } from '@phosphor-icons/react';
import React, { useCallback } from 'react';
import { Props as SelectProps } from 'react-select';
import { BaseFieldProps, Field } from 'redux-form';

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
  validator?: BaseFieldProps['validate'];
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
  // The Field `component` prop must be a stable reference. An inline
  // arrow here would be a fresh function on every parent render, causing
  // redux-form to unmount and re-mount the underlying AsyncPaginate
  // each time. The Add Resource modal hits this path twice per
  // org-change (once on customer_uuid prop change, again on isDisabled
  // flip) and the resulting DOM thrash is what makes Playwright's
  // SelectComponent click race in CI. useCallback closes over the props
  // the inner closure depends on so we only re-create the renderer
  // when those props actually change.
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
        className="metronic-select-container"
        classNamePrefix="metronic-select"
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
