import { useAsync } from 'react-use';

import { get } from '@waldur/core/api';
import { formatDateTime } from '@waldur/core/dateUtils';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { Issue } from '@waldur/issues/list/types';
import { IssueTypeIcon } from '@waldur/issues/types/IssueTypeIcon';

export const ResourceIssues = ({ resource }) => {
  const { loading, error, value } = useAsync(() =>
    get<Issue[]>('/support-issues/', { params: { resource: resource.url } }),
  );
  if (loading) {
    return <LoadingSpinner />;
  }
  if (error) {
    return (
      <p className="text-center">
        {translate('Unable to fetch resource issues.')}
      </p>
    );
  }
  if (value.data.length === 0) {
    return (
      <p className="text-center">
        {translate('There are no resource issues.')}
      </p>
    );
  }

  return (
    <>
      <div className="timeline">
        {value.data.map((issue, index) => {
          return (
            <div key={index} className="timeline-item">
              <div className="timeline-line w-40px"></div>
              <div className="timeline-icon symbol symbol-circle symbol-40px me-4">
                <div className="symbol-label bg-light">
                  <IssueTypeIcon type={issue.type} />
                </div>
              </div>
              <div className="timeline-content mb-10 mt-n1">
                <div className="pe-3 mb-5">
                  <div className="fs-5 fw-semibold mb-2">{issue.summary}</div>
                  <div className="d-flex align-items-center mt-1 fs-6">
                    <div className="text-muted me-2 fs-7">
                      {formatDateTime(issue.modified)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-center">
        <a>{translate('See more')}</a>
      </p>
    </>
  );
};
