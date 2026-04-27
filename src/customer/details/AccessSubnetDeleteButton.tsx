import { AccessSubnet, accessSubnetsDestroy } from 'waldur-js-client';

import { DeleteButton } from '@/core/buttons';
import { translate, formatJsxTemplate } from '@/i18n';

interface AccessSubnetDeleteButtonProps {
  row: AccessSubnet;
  refetch;
}

export const AccessSubnetDeleteButton = (
  props: AccessSubnetDeleteButtonProps,
) => (
  <DeleteButton
    row={props.row}
    apiFunction={(r) => accessSubnetsDestroy({ path: { uuid: r.uuid } })}
    refetch={props.refetch}
    confirmTitle={translate('Confirmation')}
    confirmMessage={(r) =>
      translate(
        'Are you sure you want to delete the {inet} access subnet?',
        { inet: <strong>{r.inet}</strong> },
        formatJsxTemplate,
      )
    }
    successMessage={translate('Access subnet has been removed.')}
    errorMessage={translate('Unable to remove access subnet.')}
    title={translate('Remove')}
  />
);
