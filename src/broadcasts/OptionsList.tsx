import { PropertyItem } from 'waldur-ui';

import { propVal } from '@/property/propertyFields';

import { IdNamePair } from './types';

export const OptionsList = ({
  label,
  list,
}: {
  label: string;
  list: IdNamePair[];
}) =>
  list ? (
    <PropertyItem
      label={label}
      value={propVal.list(
        list.map((c) =>
          typeof c === 'object' && c !== null ? c.name || String(c) : String(c),
        ),
      )}
    />
  ) : null;
