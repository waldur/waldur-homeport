import { ReactNode } from 'react';

import { FormattedProperty } from 'waldur-ui';

export type { FormattedProperty };

export const formatProp = (
  node: ReactNode,
  text: string,
): FormattedProperty => ({
  __isFormattedProperty: true,
  node,
  text,
});
