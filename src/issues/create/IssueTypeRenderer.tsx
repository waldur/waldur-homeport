import { FunctionComponent } from 'react';

import { IssueTypeOption } from './types';

export const IssueTypeRenderer: FunctionComponent<IssueTypeOption> = (
  option,
) => (
  <div className="inline-flex items-center gap-2 [&>svg]:size-[20px]">
    {option.iconNode} {option.label}
  </div>
);
