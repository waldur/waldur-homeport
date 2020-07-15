import * as React from 'react';

import { Link } from '@waldur/core/Link';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';

export const IssueLinkRenderer = ({ row }) =>
  row.issue ? (
    <Link
      state="support.detail"
      params={{ uuid: row.issue.uuid }}
      label={row.issue.key || 'N/A'}
    />
  ) : (
    <>{DASH_ESCAPE_CODE}</>
  );
