import * as React from 'react';

import { IssueTypeOption } from './types';

export const IssueTypeRenderer = (option: IssueTypeOption) => (
  <>
    <i className={`fa ${option.iconClass} ${option.textClass}`} />{' '}
    {option.label}
  </>
);
