import { FunctionComponent } from 'react';

import { IssueTypeOption } from './types';

export const IssueTypeRenderer: FunctionComponent<IssueTypeOption> = (
  option,
) => (
  <>
    {option.iconNode} {option.label}
  </>
);
