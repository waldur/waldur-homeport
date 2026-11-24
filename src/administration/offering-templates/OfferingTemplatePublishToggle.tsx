import { FC } from 'react';
import {
  marketplaceOfferingTemplatesPartialUpdate,
  OfferingTemplate,
} from 'waldur-js-client';

import { Switch } from 'waldur-ui';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';

interface OfferingTemplatePublishToggleProps {
  row: OfferingTemplate;
  refetch(): void;
}

/** Publishing a template offers it to every service provider. */
export const OfferingTemplatePublishToggle: FC<
  OfferingTemplatePublishToggleProps
> = ({ row, refetch }) => {
  const mutation = useManagedMutation({
    mutationFn: (is_published: boolean) =>
      marketplaceOfferingTemplatesPartialUpdate({
        path: { uuid: row.uuid },
        body: { is_published },
      }),
    refetch,
    closeModal: false,
    successMessage: translate('Offering template updated.'),
    errorMessage: translate('Unable to update the offering template.'),
  });
  return (
    <Switch
      checked={Boolean(row.is_published)}
      onCheckedChange={(checked) => mutation.mutate(checked)}
      disabled={mutation.isPending}
      size="sm"
      aria-label={translate('Published')}
    />
  );
};
