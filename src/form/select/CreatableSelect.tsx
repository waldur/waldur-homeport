import { FC } from 'react';
import CreatableSelectBase from 'react-select/creatable';

import { translate } from '@/i18n';

import { CustomCreatableSelectProps } from './types';
import { useSelect } from './useSelect';

export const CreatableSelect: FC<CustomCreatableSelectProps> = (props) => {
  const selectProps = useSelect(props);

  return (
    <CreatableSelectBase
      placeholder={translate('Select or type to add a new option...')}
      {...selectProps}
    />
  );
};
