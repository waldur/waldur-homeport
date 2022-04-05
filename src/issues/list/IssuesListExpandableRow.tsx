import './IssuesListExpandableRow.scss';

import { FunctionComponent } from 'react';

import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';

export const IssuesListExpandableRow: FunctionComponent<{ row }> = ({
  row,
}) => (
  <div className="container-fluid">
    <div className="issue-list-expandable-row col-sm-12">
      <div className="mb-1">
        <dt>{translate('Reporter')}:</dt>
        <dd>{row.reporter_name || 'N/A'}</dd>
      </div>

      <div className="mb-1">
        <dt>{translate('Description')}:</dt>
        <dd>
          <Tip id="description-tooltip" label={row.description}>
            <span className="ellipsis" style={{ width: 300 }}>
              {row.description}
            </span>
          </Tip>
        </dd>
      </div>

      <div className="mb-1">
        <dt>{translate('Service type')}:</dt>
        <dd>{row.resource_type || 'N/A'}</dd>
      </div>
    </div>
  </div>
);
