import { FunctionComponent } from 'react';

import { Link } from '@waldur/core/Link';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import { renderFieldOrDash } from '@waldur/table/utils';

export const IssueLinkRenderer: FunctionComponent<{ row }> = ({ row }) =>
  row.issue ? (
    <Link
      state="support.detail"
      params={{ issue_uuid: row.issue.uuid }}
      label={renderFieldOrDash(row.issue.key)}
    />
  ) : (
    <>{DASH_ESCAPE_CODE}</>
  );
