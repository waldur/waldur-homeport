import { FC } from 'react';
import CreatableSelect from 'react-select/creatable';
import { withAsyncPaginate } from 'react-select-async-paginate';

import { CustomAsyncCreatableSelectProps } from './types';
import { useAsyncSelect } from './useSelect';

const BaseAsyncCreatableSelect = withAsyncPaginate(CreatableSelect);

export const AsyncCreatableSelect: FC<CustomAsyncCreatableSelectProps> = (
  props,
) => {
  const selectProps = useAsyncSelect(props);
  return <BaseAsyncCreatableSelect {...selectProps} />;
};
