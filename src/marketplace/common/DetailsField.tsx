import { FC, PropsWithChildren } from 'react';

import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

interface DetailsFieldProps {
  label?: string;
}

export const DetailsField: FC<PropsWithChildren<DetailsFieldProps>> = (
  props,
) => <FormGroup label={props.label}>{props.children}</FormGroup>;
