import { FunctionComponent } from 'react';
import { ResourceState } from 'waldur-js-client';

import { translate } from '@/i18n';
import { SelectFilter } from '@/table';

export const getStates = (): Array<{ value: ResourceState; label: string }> => [
  { value: 'Creating', label: translate('Creating') },
  { value: 'OK', label: translate('OK') },
  { value: 'Erred', label: translate('Erred') },
  { value: 'Updating', label: translate('Updating') },
  { value: 'Terminating', label: translate('Terminating') },
];

export const ResourceStateFilter: FunctionComponent<any> = (props) => {
  return (
    <SelectFilter
      title={translate('State')}
      name="state"
      options={getStates()}
      isMulti
      {...props}
    />
  );
};
