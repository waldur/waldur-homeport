import { formatDateTime } from '@waldur/core/dateUtils';
import { Issue } from '@waldur/issues/list/types';
import { IssueTypeIcon } from '@waldur/issues/types/IssueTypeIcon';

export const IssueRow = ({ row }: { row: Issue }) => (
  <div className="timeline-item">
    <div className="timeline-line w-40px" />
    <div className="timeline-icon symbol symbol-circle symbol-40px me-4">
      <div className="symbol-label bg-light">
        <IssueTypeIcon type={row.type} />
      </div>
    </div>
    <div className="timeline-content mb-10 mt-n1">
      <div className="pe-3 mb-5">
        <div className="fs-5 fw-semibold mb-2">{row.summary}</div>
        <div className="d-flex align-items-center mt-1 fs-6">
          <div className="text-muted me-2 fs-7">
            {formatDateTime(row.modified)}
          </div>
        </div>
      </div>
    </div>
  </div>
);
