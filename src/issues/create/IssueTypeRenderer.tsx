import { FunctionComponent } from 'react';

import { IssueTypeOption } from './types';

export const IssueTypeRenderer: FunctionComponent<IssueTypeOption> = (
  option,
) => (
  <>
    <i className={`fa ${option.iconClass} ${option.textClass}`} />{' '}
    {option.label}
  </>
);
