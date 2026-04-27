import { autoprovisioningRulesDestroy } from 'waldur-js-client';

import { DeleteButton } from '@/core/buttons';
import { formatJsxTemplate, translate } from '@/i18n';

export const RuleDeleteButton = ({ row, refetch }) => (
  <DeleteButton
    row={row}
    apiFunction={(r) =>
      autoprovisioningRulesDestroy({ path: { uuid: r.uuid } })
    }
    refetch={refetch}
    confirmTitle={translate('Confirmation')}
    confirmMessage={(r) =>
      translate(
        'Are you sure you want to delete the rule {name}?',
        { name: <strong>{r.name}</strong> },
        formatJsxTemplate,
      )
    }
    successMessage={translate('Rule deleted')}
    errorMessage={translate('Unable to delete rule.')}
  />
);
