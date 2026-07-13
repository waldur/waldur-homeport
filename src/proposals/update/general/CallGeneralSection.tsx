import { useQueryClient } from '@tanstack/react-query';
import { FC } from 'react';
import { proposalProtectedCallsPartialUpdate } from 'waldur-js-client';

import { SafeMarkdown } from '@/core/SafeMarkdown';
import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import {
  EditFieldProvider,
  MarkdownEditField,
  StringEditField,
} from '@/form/editFields';
import FormTable from '@/form/FormTable';
import { SlugTemplateHelpText } from '@/form/SlugTemplateHelpText';
import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { Call } from '@/proposals/types';
import { getCallReadOnlyReason } from '@/proposals/utils';
import { renderFieldOrDash } from '@/table/utils';

interface CallGeneralSectionProps {
  call: Call;
  refetch(): void;
  loading: boolean;
  isReadOnly?: boolean;
}

const PROPOSAL_SLUG_PLACEHOLDERS = [
  { name: 'call_slug', description: 'Call slug', example: 'TEST-CALL' },
  {
    name: 'round_slug',
    description: 'Round slug',
    example: 'TEST-ROUND-202401',
  },
  { name: 'org_slug', description: 'Organization slug', example: 'acme' },
  { name: 'year', description: 'Current year (4-digit)', example: '2026' },
  { name: 'month', description: 'Current month (2-digit)', example: '04' },
  {
    name: 'counter',
    description: 'Sequential proposal number',
    example: '3',
  },
  {
    name: 'counter_padded',
    description: 'Zero-padded 3-digit counter',
    example: '003',
  },
];

export const CallGeneralSection: FC<CallGeneralSectionProps> = (props) => {
  const queryClient = useQueryClient();

  const { mutateAsync: updateCall } = useManagedMutation({
    mutationFn: (formData: Record<string, any>) =>
      proposalProtectedCallsPartialUpdate({
        path: { uuid: props.call.uuid },
        body: formData,
      }),
    successMessage: translate('The call has been updated.'),
    errorMessage: translate('Unable to update call.'),
    onSuccess: async () => {
      props.refetch();
      await queryClient.invalidateQueries({
        queryKey: ['Call', props.call.uuid],
      });
    },
    closeModal: false,
  });

  return (
    <FormTable.Card
      title={translate('General')}
      className="card-bordered"
      refetch={props.refetch}
      loading={props.loading}
    >
      <EditFieldProvider
        scope={props.call}
        callback={updateCall}
        readOnlyReason={
          props.isReadOnly ? getCallReadOnlyReason(props.call) : undefined
        }
      >
        <FormTable>
          <StringEditField
            name="name"
            label={translate('Name')}
            required
            disabled={props.isReadOnly}
            renderValue={(value) => renderFieldOrDash(value)}
          />
          <MarkdownEditField
            name="description"
            label={translate('Description')}
            required
            disabled={props.isReadOnly}
            renderValue={(value) =>
              value ? <SafeMarkdown text={value} /> : renderFieldOrDash(null)
            }
          />
          <StringEditField
            name="reference_code"
            label={translate('Reference code')}
            disabled={props.isReadOnly}
            renderValue={(value) => renderFieldOrDash(value)}
          />
          <StringEditField
            name="proposal_slug_template"
            label={translate('Proposal slug template')}
            description={
              <SlugTemplateHelpText placeholders={PROPOSAL_SLUG_PLACEHOLDERS} />
            }
            descriptionInEditOnly
            disabled={props.isReadOnly || props.call.has_proposals}
            tooltip={
              !props.isReadOnly && props.call.has_proposals
                ? translate(
                    'The slug template cannot be changed once proposals exist for this call.',
                  )
                : undefined
            }
            renderValue={(value) => renderFieldOrDash(value)}
          />
          {isFeatureVisible(MarketplaceFeatures.call_only) && (
            <StringEditField
              name="external_url"
              label={translate('External URL')}
              required
              disabled={props.isReadOnly}
              renderValue={(value) => renderFieldOrDash(value)}
            />
          )}
        </FormTable>
      </EditFieldProvider>
    </FormTable.Card>
  );
};
