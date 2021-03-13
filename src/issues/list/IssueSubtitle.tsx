import { formatDate } from '@waldur/core/dateUtils';
import { formatJsxTemplate, translate } from '@waldur/i18n';

import { IssueOrganization } from './IssueOrganization';
import { IssueUser } from './IssueUser';

export const IssueSubtitle = ({ item }) => {
  const context = {
    user: <IssueUser item={item} />,
    organization: <IssueOrganization item={item} />,
    date: formatDate(item.created),
  };
  return (
    <>
      {item.customer_uuid
        ? translate(
            'Opened by {user} from {organization} at {date}',
            context,
            formatJsxTemplate,
          )
        : translate('Opened by {user} at {date}', context, formatJsxTemplate)}
    </>
  );
};
