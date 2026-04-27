import { Field } from '@/resource/summary';

import { IdNamePair } from './types';

export const OptionsList = ({
  label,
  list,
}: {
  label: string;
  list: IdNamePair[];
}) =>
  list ? (
    <Field
      label={label}
      value={list.map((c) => c.name || c).join(', ')}
      labelCol={5}
      valueCol={7}
    />
  ) : null;
