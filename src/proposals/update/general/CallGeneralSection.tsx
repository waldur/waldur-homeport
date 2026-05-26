import { FC } from 'react';

import { SafeMarkdown } from '@/core/SafeMarkdown';
import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { Call } from '@/proposals/types';
import { renderFieldOrDash } from '@/table/utils';

import { EditGeneralInfoButton } from './EditGeneralInfoButton';

interface CallGeneralSectionProps {
  call: Call;
  refetch(): void;
  loading: boolean;
  isReadOnly?: boolean;
}

export const CallGeneralSection: FC<CallGeneralSectionProps> = (props) => {
  return (
    <FormTable.Card
      title={translate('General')}
      className="card-bordered"
      refetch={props.refetch}
      loading={props.loading}
    >
      <FormTable>
        <FormTable.Item
          label={translate('Name')}
          value={renderFieldOrDash(props.call.name)}
          actions={
            <EditGeneralInfoButton
              call={props.call}
              name="name"
              title={translate('Edit name')}
              refetch={props.refetch}
              disabled={props.isReadOnly}
            />
          }
        />
        <FormTable.Item
          label={translate('Description')}
          value={
            props.call.description ? (
              <SafeMarkdown text={props.call.description} />
            ) : (
              renderFieldOrDash(null)
            )
          }
          actions={
            <EditGeneralInfoButton
              call={props.call}
              name="description"
              title={translate('Edit description')}
              refetch={props.refetch}
              disabled={props.isReadOnly}
            />
          }
        />
        <FormTable.Item
          label={translate('Reference code')}
          value={renderFieldOrDash(props.call.reference_code)}
          actions={
            <EditGeneralInfoButton
              call={props.call}
              name="reference_code"
              title={translate('Edit reference code')}
              refetch={props.refetch}
              disabled={props.isReadOnly}
            />
          }
        />
        <FormTable.Item
          label={translate('Proposal slug template')}
          value={renderFieldOrDash(props.call.proposal_slug_template)}
          actions={
            <EditGeneralInfoButton
              call={props.call}
              name="proposal_slug_template"
              title={translate('Edit proposal slug template')}
              refetch={props.refetch}
              disabled={props.isReadOnly}
            />
          }
        />
        {isFeatureVisible(MarketplaceFeatures.call_only) && (
          <FormTable.Item
            label={translate('External URL')}
            value={renderFieldOrDash(props.call.external_url)}
            actions={
              <EditGeneralInfoButton
                call={props.call}
                name="external_url"
                title={translate('Edit external URL')}
                refetch={props.refetch}
                disabled={props.isReadOnly}
              />
            }
          />
        )}
      </FormTable>
    </FormTable.Card>
  );
};
