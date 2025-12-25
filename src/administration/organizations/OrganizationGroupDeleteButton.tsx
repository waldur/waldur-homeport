import { OrganizationGroup, organizationGroupsDestroy } from 'waldur-js-client';

import { DeleteButton } from '@waldur/core/buttons';
import { formatJsxTemplate, translate } from '@waldur/i18n';

interface OrganizationGroupDeleteButtonProps {
  row: OrganizationGroup;
  refetch;
}

export const OrganizationGroupDeleteButton = (
  props: OrganizationGroupDeleteButtonProps,
) => (
  <DeleteButton
    row={props.row}
    apiFunction={(r) => organizationGroupsDestroy({ path: { uuid: r.uuid } })}
    refetch={props.refetch}
    confirmTitle={translate('Confirmation')}
    confirmMessage={(r) =>
      translate(
        'Are you sure you want to delete the {name} organization group?',
        { name: <strong>{r.name}</strong> },
        formatJsxTemplate,
      )
    }
    errorMessage={translate('Unable to remove organization group.')}
    title={translate('Remove')}
  />
);
