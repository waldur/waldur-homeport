import { CheckIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC, useEffect } from 'react';
import {
  checklistsAdminRetrieve,
  marketplaceProviderOfferingsUpdateOverview,
} from 'waldur-js-client';

import { CheckOrX } from '@/core/CheckOrX';
import { UI_STALE_TIME } from '@/core/constants';
import { FormattedHtml } from '@/core/FormattedHtml';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinnerSimple } from '@/core/LoadingSpinner';
import { getUUID } from '@/core/utils';
import {
  EditFieldProvider,
  MarkdownEditField,
  StringEditField,
} from '@/form/editFields';
import FormTable from '@/form/FormTable';
import { TabbedSection } from '@/form/TabbedSection';
import { translate } from '@/i18n';
import { REMOTE_OFFERING_TYPE } from '@/marketplace-remote/constants';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { OfferingSectionProps } from '../types';

import { EditChecklistButton } from './EditChecklistButton';
import { EditGettingStartedButton } from './EditGettingStartedButton';
import { EditOfferingProfileButton } from './EditOfferingProfileButton';
import { EditTagsButton } from './EditTagsButton';
import { OfferingLocationButton } from './OfferingLocationButton';
import { OfferingMediaButton } from './OfferingMediaButton';
import { SetAccessPolicyButton } from './SetAccessPolicyButton';
import { pickOverview } from './utils';

export const OverviewSection: FC<OfferingSectionProps> = (props) => {
  const isRemote = props.offering.type === REMOTE_OFFERING_TYPE;
  const remoteTooltip = isRemote
    ? translate('Field is synchronised from the remote offering')
    : undefined;

  const { mutateAsync: update } = useManagedMutation({
    mutationFn: async (formData: any) => {
      return await marketplaceProviderOfferingsUpdateOverview({
        path: { uuid: props.offering.uuid },
        body: {
          ...pickOverview(props.offering),
          ...formData,
        },
      });
    },
    successMessage: translate('Offering has been updated successfully.'),
    errorMessage: translate('Unable to update offering.'),
    refetch: props.refetch,
  });

  const checklistQuery = useQuery({
    queryKey: ['offeringChecklist', props.offering.uuid],
    queryFn: () =>
      props.offering.has_compliance_requirements
        ? checklistsAdminRetrieve({
            path: { uuid: getUUID(props.offering.compliance_checklist) },
          }).then((response) => response.data)
        : null,
    staleTime: UI_STALE_TIME,
  });

  useEffect(() => {
    checklistQuery.refetch();
  }, [props.offering.compliance_checklist, checklistQuery.refetch]);

  return (
    <EditFieldProvider scope={props.offering} callback={update}>
      <TabbedSection enableSearch>
        <TabbedSection.Tab id="basic" title={translate('Basic info')}>
          <StringEditField
            name="name"
            label={translate('Name')}
            description={translate(
              "Enter the offering's name as it will appear to users.",
            )}
            warnTooltip={translate('Offering name is required.')}
            required={true}
            disabled={isRemote}
            tooltip={remoteTooltip}
          />
          <MarkdownEditField
            name="description"
            label={translate('Description')}
            description={translate('Provide a brief overview of the offering.')}
            renderValue={(value) => <FormattedHtml html={value} />}
            disabled={isRemote}
            tooltip={remoteTooltip}
          />
          <MarkdownEditField
            name="full_description"
            label={translate('Full description')}
            description={translate(
              'Add a detailed explanation of what the offering includes.',
            )}
            renderValue={(value) => <FormattedHtml html={value} />}
            disabled={isRemote}
            tooltip={remoteTooltip}
          />
          <FormTable.Item
            label={translate('Getting started instructions')}
            description={translate(
              'Provide steps to help users begin using the offering.',
            )}
            value={<CheckOrX value={props.offering.getting_started} />}
            actions={
              <EditGettingStartedButton
                offering={props.offering}
                refetch={props.refetch}
              />
            }
          />
        </TabbedSection.Tab>

        <TabbedSection.Tab id="links" title={translate('Links')}>
          <StringEditField
            name="privacy_policy_link"
            label={translate('Privacy policy link')}
            description={translate(
              'Add a link to your privacy policy for this offering.',
            )}
            disabled={isRemote}
            tooltip={remoteTooltip}
          />
          <StringEditField
            name="access_url"
            label={translate('Access URL')}
            description={translate(
              'Provide the URL users will use to access the offering.',
            )}
            disabled={isRemote}
            tooltip={remoteTooltip}
          />
          <StringEditField
            name="documentation_url"
            label={translate('Documentation URL')}
            description={translate(
              'Link to the documentation for this offering.',
            )}
            disabled={isRemote}
            tooltip={remoteTooltip}
          />
          <StringEditField
            name="helpdesk_url"
            label={translate('Helpdesk URL')}
            description={translate(
              'Link to the helpdesk or support portal for this offering.',
            )}
            disabled={isRemote}
            tooltip={remoteTooltip}
          />
        </TabbedSection.Tab>

        <TabbedSection.Tab id="media" title={translate('Media')}>
          <FormTable.Item
            label={translate('Logo')}
            description={translate(
              'Upload an image to represent the offering visually.',
            )}
            value={<CheckOrX value={props.offering.thumbnail} />}
            actions={
              <OfferingMediaButton
                offering={props.offering}
                refetch={props.refetch}
                mediaType="thumbnail"
              />
            }
          />
          <FormTable.Item
            label={translate('Image')}
            description={translate(
              'Upload a background image for the offering.',
            )}
            value={<CheckOrX value={props.offering.image} />}
            actions={
              <OfferingMediaButton
                offering={props.offering}
                refetch={props.refetch}
                mediaType="image"
              />
            }
          />
        </TabbedSection.Tab>

        <TabbedSection.Tab id="access" title={translate('Access & Discovery')}>
          <FormTable.Item
            label={translate('Location')}
            description={translate('Specify where the offering is hosted.')}
            value={
              <CheckOrX
                value={props.offering.latitude && props.offering.longitude}
              />
            }
            actions={
              <OfferingLocationButton
                offering={props.offering}
                refetch={props.refetch}
              />
            }
          />
          <FormTable.Item
            label={translate('Tags')}
            description={translate(
              'Add tags to help users find this offering more easily.',
            )}
            value={
              props.offering.tags?.length > 0
                ? props.offering.tags.map((tag) => tag.name).join(', ')
                : 'N/A'
            }
            actions={
              <EditTagsButton
                offering={props.offering}
                refetch={props.refetch}
              />
            }
          />
          <FormTable.Item
            label={translate('Service profile')}
            description={translate(
              'Bind to a profile to use a centrally-managed role catalog (staff-only).',
            )}
            value={
              (props.offering as any).profile_name || translate('— None —')
            }
            actions={
              <EditOfferingProfileButton
                offering={props.offering}
                refetch={props.refetch}
              />
            }
          />
        </TabbedSection.Tab>

        <TabbedSection.Tab id="compliance" title={translate('Compliance')}>
          <FormTable.Item
            label={translate('Access policies')}
            description={translate(
              'Define the organization groups that are allowed to access the offering.',
            )}
            value={
              props.offering.organization_groups?.length > 0
                ? props.offering.organization_groups
                    .map(({ name }) => name)
                    .join(', ')
                : 'N/A'
            }
            actions={
              <SetAccessPolicyButton
                offering={props.offering}
                refetch={props.refetch}
              />
            }
          />
          <FormTable.Item
            label={translate('Compliance checklist')}
            value={
              !props.offering.has_compliance_requirements ? (
                'N/A'
              ) : (
                <>
                  {!checklistQuery.data && (
                    <CheckIcon weight="bold" className="text-info" />
                  )}
                  {checklistQuery.isLoading ? (
                    <LoadingSpinnerSimple />
                  ) : checklistQuery.error ? (
                    <LoadingErred
                      loadData={checklistQuery.refetch}
                      className="d-inline-flex flex-center gap-4 ms-4"
                    />
                  ) : checklistQuery.data ? (
                    <>
                      {checklistQuery.data.name}
                      <span className="text-muted ms-2">
                        (
                        {translate('{count} questions', {
                          count: checklistQuery.data.questions_count,
                        })}
                        )
                      </span>
                    </>
                  ) : null}
                </>
              )
            }
            actions={
              <EditChecklistButton
                offering={props.offering}
                checklist={checklistQuery.data ?? undefined}
                refetch={props.refetch}
              />
            }
          />
        </TabbedSection.Tab>

        <TabbedSection.Tab id="identifiers" title={translate('Identifiers')}>
          <FormTable.Item
            label={translate('UUID')}
            value={props.offering.uuid}
          />
          <StringEditField
            name="backend_id"
            label={translate('Backend ID')}
            description={translate(
              'Unique identifier for the backend system associated with this offering.',
            )}
            disabled={isRemote}
            tooltip={remoteTooltip}
          />
          <StringEditField
            name="slug"
            label={translate('Slug')}
            description={translate(
              'A POSIX-friendly unique identifier for the offering.',
            )}
            disabled={isRemote}
            tooltip={remoteTooltip}
          />
        </TabbedSection.Tab>
      </TabbedSection>
    </EditFieldProvider>
  );
};
