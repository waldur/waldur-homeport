import { FC } from 'react';
import BaseSelect from 'react-select';
import { withAsyncPaginate } from 'react-select-async-paginate';

import { CustomAsyncSelectProps } from './types';
import { useAsyncSelect } from './useSelect';

const BaseAsyncPaginate = withAsyncPaginate(BaseSelect);

export const AsyncSelect: FC<CustomAsyncSelectProps> = (props) => {
  const selectProps = useAsyncSelect(props);
  return <BaseAsyncPaginate {...selectProps} />;
};
