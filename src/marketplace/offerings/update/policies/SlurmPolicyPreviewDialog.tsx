import { useQuery } from '@tanstack/react-query';
import { FC, useState } from 'react';
import { Form } from 'react-bootstrap';
import { Resource, marketplaceResourcesList } from 'waldur-js-client';

import { SelectField } from '@/form';
import { translate } from '@/i18n';
import { Offering } from '@/marketplace/types';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';

import { SlurmPolicyPreview } from './SlurmPolicyPreview';

interface SlurmPolicyPreviewDialogProps {
  resolve: {
    formValues: {
      grace_ratio?: number;
      carryover_factor?: number;
      carryover_enabled?: boolean;
    };
    offering: Offering;
  };
}

export const SlurmPolicyPreviewDialog: FC<SlurmPolicyPreviewDialogProps> = ({
  resolve,
}) => {
  const [selectedResource, setSelectedResource] = useState<Resource | null>(
    null,
  );

  // Fetch resources for this offering
  const { data: resources, isLoading: resourcesLoading } = useQuery({
    queryKey: ['offering-resources', resolve.offering?.uuid],
    queryFn: async () => {
      if (!resolve.offering) return [];
      const response = await marketplaceResourcesList({
        query: {
          offering_uuid: [resolve.offering.uuid],
          state: ['OK', 'Erred'] as const,
          page_size: 100,
        },
      });
      return response.data || [];
    },
    enabled: !!resolve.offering,
  });

  const resourceOptions = (resources || []).map((r: Resource) => ({
    value: r,
    label: r.name || r.uuid,
  }));

  return (
    <ModalDialog
      title={translate('Policy Impact Preview')}
      footer={<CloseDialogButton label={translate('Close')} />}
    >
      {resourceOptions.length > 0 && (
        <div className="mb-4">
          <Form.Label>{translate('Select Resource')}</Form.Label>
          <SelectField
            input={{
              value: selectedResource
                ? { value: selectedResource, label: selectedResource.name }
                : null,
              onChange: (option: { value: Resource } | null) =>
                setSelectedResource(option?.value || null),
              name: 'resource',
              onBlur: () => {},
              onFocus: () => {},
            }}
            meta={{}}
            options={resourceOptions}
            isClearable
            placeholder={translate('Use example values (no resource selected)')}
            isLoading={resourcesLoading}
          />
          <div className="form-text">
            {translate(
              'Select a resource to use its actual limits and usage for the preview.',
            )}
          </div>
        </div>
      )}
      <SlurmPolicyPreview
        formValues={resolve.formValues}
        resource={selectedResource}
      />
    </ModalDialog>
  );
};
