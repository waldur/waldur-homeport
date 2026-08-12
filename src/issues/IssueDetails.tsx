import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { FunctionComponent, ReactNode } from 'react';
import { Issue, supportIssuesRetrieve } from 'waldur-js-client';

import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { useBreadcrumbs } from '@/navigation/context';
import { useTitle } from '@/navigation/title';

import { IssueDetailsContent } from './IssueDetailsContent';
import { useIssueBreadcrumbItems } from './utils';

const loadIssue = async (issueId: string) => {
  const issue = await supportIssuesRetrieve({ path: { uuid: issueId } });
  return issue.data;
};

interface IssueDetailsProps {
  /** 'provider' hides staff-only actions and shows injected provider actions. */
  context?: 'staff' | 'provider';
  renderActions?: (issue: Issue, refetch: () => void) => ReactNode;
}

export const IssueDetails: FunctionComponent<IssueDetailsProps> = ({
  context = 'staff',
  renderActions,
}) => {
  useTitle(translate('Request detail'));

  const {
    params: { issue_uuid },
  } = useCurrentStateAndParams();
  const router = useRouter();

  if (!issue_uuid) {
    router.stateService.go('errorPage.notFound');
  }

  const {
    data: issue,
    isLoading,
    isRefetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ['Issue', issue_uuid],
    queryFn: () => loadIssue(issue_uuid),
    refetchOnWindowFocus: false,
  });

  const breadcrumbItems = useIssueBreadcrumbItems(issue);

  useBreadcrumbs(breadcrumbItems);

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
      context={context}
      renderActions={renderActions}
    />
  );
};
