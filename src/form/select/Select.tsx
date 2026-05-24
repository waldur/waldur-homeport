import { FC } from 'react';
import BaseSelect from 'react-select';

import { translate } from '@/i18n';

import { CustomSelectProps } from './types';
import { useSelect } from './useSelect';

export const Select: FC<CustomSelectProps> = (props) => {
  const selectProps = useSelect(props);
  return <BaseSelect placeholder={translate('Select...')} {...selectProps} />;
};
