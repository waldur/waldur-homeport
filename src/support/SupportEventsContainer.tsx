import { Card } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { useReportingBreadcrumbs } from '@waldur/issues/workspace/SupportWorkspace';
import { useSidebarKey } from '@waldur/navigation/context';
import { useTitle } from '@waldur/navigation/title';
import { SupportEventsList } from '@waldur/support/SupportEventsList';
import { SupportEventsListFilter } from '@waldur/support/SupportEventsListFilter';

export const SupportEventsContainer = () => {
  useTitle(translate('Audit logs'));
  useReportingBreadcrumbs();
  useSidebarKey('reporting');
  return (
    <Card>
      <Card.Body>
        <SupportEventsListFilter />
        <SupportEventsList />
      </Card.Body>
    </Card>
  );
};
