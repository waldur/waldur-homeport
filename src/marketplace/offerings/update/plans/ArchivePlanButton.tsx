import { TrashIcon } from '@phosphor-icons/react';
import { marketplacePlansArchive } from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@/i18n';
import { useOpenOfferingChange } from '@/marketplace/offerings/dependents/useOpenOfferingChange';
import { ActionItem } from '@/resource/actions/ActionItem';

export const ArchivePlanButton = ({ offering, plan, refetch }) => {
  const openChange = useOpenOfferingChange();
  return (
    <ActionItem
      title={translate('Archive')}
      action={() =>
        openChange({
          title: translate('Confirmation'),
          body: translate(
            'Are you sure you want to archive plan {name}?',
            { name: <b>{plan.name}</b> },
            formatJsxTemplate,
          ),
          change: 'plan_archived',
          offeringUuid: offering.uuid,
          planUuid: plan.uuid,
          confirmLabel: translate('Archive'),
          mutationFn: () =>
            marketplacePlansArchive({ path: { uuid: plan.uuid } }),
          successMessage: translate('Plan has been archived.'),
          errorMessage: translate('Unable to archive plan.'),
          onSuccess: refetch,
        })
      }
      iconNode={<TrashIcon weight="bold" />}
    />
  );
};
