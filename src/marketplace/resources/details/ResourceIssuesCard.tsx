import { PlusCircleIcon } from '@phosphor-icons/react';
import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { translate } from '@/i18n';
import { openIssueCreateDialog } from '@/issues/create/actions';
import { hasSupport } from '@/issues/hooks';
import { IssuesList } from '@/issues/list/IssuesList';
import { ActionButton } from '@/table/ActionButton';
import { PAGE_SIZE_COMPACT } from '@/table/constants';

const CreateIssueButton = ({ resource }) => {
  const dispatch = useDispatch();
  const callback = () =>
    dispatch(
      openIssueCreateDialog({
        scope: resource,
        scopeType: 'resource',
      }),
    );
  return (
    <ActionButton
      iconNode={<PlusCircleIcon weight="bold" />}
      title={translate('Create')}
      action={callback}
      variant="primary"
    />
  );
};

export const ResourceIssuesCard = ({ resource }) => {
  const showIssues = useSelector(hasSupport);
  const filter = useMemo(() => ({ resource: resource.url }), [resource]);

  return showIssues ? (
    <IssuesList
      scope={resource}
      scopeType="resource"
      filter={filter}
      title={translate('Support')}
      verboseName={translate('Support requests')}
      initialPageSize={PAGE_SIZE_COMPACT}
      tableActions={<CreateIssueButton resource={resource} />}
      standalone={false}
    />
  ) : null;
};
