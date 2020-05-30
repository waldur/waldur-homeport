import * as React from 'react';
import Select from 'react-select';
import useAsync from 'react-use/lib/useAsync';

export const AsyncSelectField = ({
  input: { value: selectedValue, onChange },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  meta,
  loadOptions,
  ...props
}: any) => {
  const [inputValue, setInputValue] = React.useState('');
  const { loading: isLoading, value: asyncValue } = useAsync(
    () => loadOptions(inputValue),
    [inputValue, loadOptions],
  );
  return (
    <Select
      value={selectedValue}
      onChange={onChange}
      options={asyncValue?.options}
      onInputChange={setInputValue}
      isLoading={isLoading}
      {...props}
    />
  );
};
