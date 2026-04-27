import { ScienceDomain, scienceDomainsDestroy } from 'waldur-js-client';

import { DeleteButton } from '@/core/buttons';
import { formatJsxTemplate, translate } from '@/i18n';

interface ScienceDomainDeleteButtonProps {
  row: ScienceDomain;
  refetch;
}

export const ScienceDomainDeleteButton = (
  props: ScienceDomainDeleteButtonProps,
) => (
  <DeleteButton
    row={props.row}
    apiFunction={(r) => scienceDomainsDestroy({ path: { uuid: r.uuid } })}
    refetch={props.refetch}
    confirmTitle={translate('Confirmation')}
    confirmMessage={(r) =>
      translate(
        'Are you sure you want to delete the {name} science domain? This will also delete all its sub-domains.',
        { name: <strong>{r.name}</strong> },
        formatJsxTemplate,
      )
    }
    errorMessage={translate('Unable to remove science domain.')}
    title={translate('Remove')}
  />
);
