import { useQuery } from '@tanstack/react-query';
import { FC, useState } from 'react';
import { Issue, supportIssuesRetrieve } from 'waldur-js-client';

import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { IssueDetailsContent } from '@/issues/IssueDetailsContent';
import { IssuesList } from '@/issues/list/IssuesList';
import { NoResult } from '@/navigation/header/search/NoResult';
import { PAGE_SIZE_FULL } from '@/table/constants';
import { useUser } from '@/workspace/hooks';

const loadIssue = async (uuid: string) => {
  const response = await supportIssuesRetrieve({ path: { uuid } });
  return response.data;
};

const SelectedIssueDetails: FC<{ uuid: string }> = ({ uuid }) => {
  const {
    data: issue,
    isLoading,
    isRefetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ['Issue', uuid],
    queryFn: () => loadIssue(uuid),
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }
  if (error || !issue) {
    return <LoadingErred loadData={refetch} />;
  }
  return (
    <IssueDetailsContent
      issue={issue}
      refetch={refetch}
      isRefetching={isRefetching}
    />
  );
};

/**
 * Expanded ("full screen") Helpdesk drawer: the support-request table on the
 * left and the selected request's detail on the right, both reusing the same
 * components as the standalone pages. Selection is local to this component, so
 * picking a row swaps the right pane without a route change.
 */
export const HelpdeskExpanded: FC = () => {
  const user = useUser();
  const [selectedUuid, setSelectedUuid] = useState<string | null>(null);

  return (
    <div className="helpdesk-expanded">
      <div className="helpdesk-expanded-list">
        <IssuesList
          scope={user}
          initialPageSize={PAGE_SIZE_FULL}
          hiddenColumns={['caller', 'time_in_progress', 'customer', 'project']}
          hideTitle
          standalone={false}
          cardBordered={false}
          onIssueSelect={(issue: Issue) => setSelectedUuid(issue.uuid)}
          selectedIssueUuid={selectedUuid ?? undefined}
        />
      </div>
      <div className="helpdesk-expanded-detail">
        {selectedUuid ? (
          <SelectedIssueDetails key={selectedUuid} uuid={selectedUuid} />
        ) : (
          <NoResult
            className="helpdesk-expanded-empty"
            title={translate('No request selected')}
            message={
              <p className="mb-0">
                {translate('Pick a request from the list to see its details.')}
              </p>
            }
            noAction
          />
        )}
      </div>
    </div>
  );
};
