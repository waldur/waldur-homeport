import {
  FilterSelectClearIndicator,
  MultiSelectLimitedValueContainer,
  MultiSelectOption,
  MultiSelectValue,
  SelectDropdownIndicator,
} from './components';

export const reorderOptions = (options, value, getOptionValue, isMulti) => {
  if (!Array.isArray(options) || value === null) return options;
  if (isMulti) {
    if (!Array.isArray(value) || value.length === 0) return options;
    const selectedValues = new Set(value.map(getOptionValue));
    const selectedOptions = options.filter((opt) =>
      selectedValues.has(getOptionValue(opt)),
    );
    const unselectedOptions = options.filter(
      (opt) => !selectedValues.has(getOptionValue(opt)),
    );
    return [...selectedOptions, ...unselectedOptions];
  } else {
    // single select
    const selectedValue = getOptionValue(value);
    const selectedOption = options.find(
      (opt) => getOptionValue(opt) === selectedValue,
    );
    const unselectedOptions = options.filter(
      (opt) => getOptionValue(opt) !== selectedValue,
    );
    return selectedOption ? [selectedOption, ...unselectedOptions] : options;
  }
};

export const reorderAsyncOptions = (
  options,
  value,
  getOptionValue,
  isMulti,
  page,
) => {
  if (!Array.isArray(options) || value === null) return options;
  if (isMulti) {
    if (!Array.isArray(value) || value.length === 0) return options;
    const selectedValues = new Set(value.map(getOptionValue));
    const unselectedOptions = options.filter(
      (opt) => !selectedValues.has(getOptionValue(opt)),
    );

    if (page === 1) {
      return value.concat(unselectedOptions);
    }
    return unselectedOptions;
  } else {
    const selectedValue = getOptionValue(value);
    const selectedOption = options.find(
      (opt) => getOptionValue(opt) === selectedValue,
    );
    const unselectedOptions = options.filter(
      (opt) => getOptionValue(opt) !== selectedValue,
    );

    if (page === 1) {
      if (selectedOption) return [selectedOption].concat(unselectedOptions);
      else if (value) return [value].concat(options);
      else return options;
    }
    if (selectedOption) return unselectedOptions;
    return options;
  }
};

export const composeComponents = (components: any, isMulti: boolean) => {
  let defaultComponents: any = {
    ClearIndicator: FilterSelectClearIndicator,
    DropdownIndicator: SelectDropdownIndicator,
  };

  if (isMulti) {
    defaultComponents = {
      ...defaultComponents,
      Option: MultiSelectOption,
      MultiValue: MultiSelectValue,
      ValueContainer: MultiSelectLimitedValueContainer,
    };
  }

  return { ...defaultComponents, ...components };
};
