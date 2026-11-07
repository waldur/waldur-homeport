import { FC } from 'react';
import { CallTemplate, callTemplatesPartialUpdate } from 'waldur-js-client';

import { Switch } from 'waldur-ui';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';

interface CallTemplatePublishToggleProps {
  row: CallTemplate;
  refetch(): void;
}

/** Publishing a template offers it to every call manager. */
export const CallTemplatePublishToggle: FC<CallTemplatePublishToggleProps> = ({
  row,
  refetch,
}) => {
  const mutation = useManagedMutation({
    mutationFn: (is_published: boolean) =>
      callTemplatesPartialUpdate({
        path: { uuid: row.uuid },
        body: { is_published },
      }),
    refetch,
    closeModal: false,
    successMessage: translate('Call template updated.'),
    errorMessage: translate('Unable to update the call template.'),
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
