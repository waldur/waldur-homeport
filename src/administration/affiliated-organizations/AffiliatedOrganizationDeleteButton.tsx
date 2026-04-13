import {
  AffiliatedOrganization,
  affiliatedOrganizationsDestroy,
} from 'waldur-js-client';

import { DeleteButton } from '@waldur/core/buttons';
import { formatJsxTemplate, translate } from '@waldur/i18n';

interface AffiliatedOrganizationDeleteButtonProps {
  row: AffiliatedOrganization;
  refetch;
}

export const AffiliatedOrganizationDeleteButton = (
  props: AffiliatedOrganizationDeleteButtonProps,
) => (
  <DeleteButton
    row={props.row}
    apiFunction={(r) =>
      affiliatedOrganizationsDestroy({ path: { uuid: r.uuid } })
    }
    refetch={props.refetch}
    confirmTitle={translate('Confirmation')}
    confirmMessage={(r) =>
      translate(
        'Are you sure you want to delete the {name} affiliated organization?',
        { name: <strong>{r.name}</strong> },
        formatJsxTemplate,
      )
    }
    errorMessage={translate('Unable to remove affiliated organization.')}
    title={translate('Remove')}
  />
);
