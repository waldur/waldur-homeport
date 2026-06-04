import { FC } from 'react';

import { required } from '@/core/validators';
import { SelectGroup } from '@/form';
import { translate } from '@/i18n';

interface NodeFlavorGroupProps {
  options: any[];
}

export const NodeFlavorGroup: FC<NodeFlavorGroupProps> = (props) => (
  <SelectGroup
    label={translate('Flavor')}
    required={true}
    name="flavor"
    options={props.options}
    validate={required}
  />
);
