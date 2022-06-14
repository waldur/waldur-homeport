import { useState } from 'react';
import { useAsync } from 'react-use';

import { Select } from '@waldur/form/themed-select';

export const AsyncSelectField = ({
  input: { value: selectedValue, onChange },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  meta,
  loadOptions,
  ...props
}: any) => {
  const [inputValue, setInputValue] = useState('');
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
