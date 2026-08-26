import { FC, useMemo } from 'react';
import { ProviderCannedResponse } from 'waldur-js-client';

import { translate } from '@/i18n';
import { ScopeSubtitle } from '@/modal/ScopeSubtitle';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';

import { useCreateCannedResponse, useUpdateCannedResponse } from '../api';

interface OwnProps {
  resolve: {
    helpdeskUuid: string;
    response?: ProviderCannedResponse;
    refetch: () => void;
  };
}

export const CannedResponseDialog: FC<OwnProps> = ({
  resolve: { helpdeskUuid, response, refetch },
}) => {
  const isEdit = Boolean(response);
  const createMutation = useCreateCannedResponse(refetch);
  const updateMutation = useUpdateCannedResponse(refetch);

  const handleSubmit = async (formData) => {
    if (isEdit) {
      await updateMutation.mutateAsync({
        uuid: response!.uuid,
        body: {
          name: formData.name,
          category: formData.category || undefined,
          text: formData.text,
        },
      });
    } else {
      await createMutation.mutateAsync({
        provider_helpdesk: helpdeskUuid,
        name: formData.name,
        category: formData.category || undefined,
        text: formData.text,
      });
    }
  };

  const fields = [
    { name: 'name', label: translate('Name'), type: 'string', required: true },
    { name: 'category', label: translate('Category'), type: 'string' },
    { name: 'text', label: translate('Text'), type: 'text', required: true },
  ];

  const initialValues = useMemo(
    () =>
      isEdit
        ? {
            name: response!.name,
            category: response!.category,
            text: response!.text,
          }
        : {},
    [isEdit, response],
  );

  return (
    <ResourceActionDialog
      dialogTitle={
        isEdit
          ? translate('Edit canned response')
          : translate('Add canned response')
      }
      dialogSubtitle={
        isEdit ? (
          <ScopeSubtitle
            label={translate('Response name')}
            name={response!.name}
          />
        ) : undefined
      }
      formFields={fields}
      initialValues={initialValues}
      submitForm={handleSubmit}
    />
  );
};
