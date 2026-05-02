import { PlusCircleIcon } from '@phosphor-icons/react';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { ISSUE_CREATION_FORM_ID } from '@/issues/create/constants';
import { hasSupport } from '@/issues/hooks';
import { IssuesList } from '@/issues/list/IssuesList';
import { useModal } from '@/modal/actions';
import { ActionButton } from '@/table/ActionButton';
import { PAGE_SIZE_COMPACT } from '@/table/constants';

const IssueCreateDialog = lazyComponent(() =>
  import('@/issues/create/IssueCreateDialog').then((module) => ({
    default: module.IssueCreateDialog,
  })),
);

const CreateIssueButton = ({ resource }) => {
  const { openDialog } = useModal();
  const callback = () =>
    openDialog(IssueCreateDialog, {
      resolve: {
        scope: resource,
        scopeType: 'resource',
      },
      dialogClassName: 'modal-dialog-centered mw-650px',
      formId: ISSUE_CREATION_FORM_ID,
    });
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
