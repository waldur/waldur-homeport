import { FC } from 'react';

import { Code, FormText, PropertyCard, PropertyList } from 'waldur-ui';

import { SafeMarkdown } from '@/core/SafeMarkdown';
import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import {
  EditFieldProvider,
  MarkdownEditField,
  StringEditField,
} from '@/form/editFields';
import { SlugTemplateHelpText } from '@/form/SlugTemplateHelpText';
import { formatJsxTemplate, translate } from '@/i18n';
import { DEFAULT_PROJECT_NAME_TEMPLATE } from '@/proposals/proposalProjectName';
import { Call } from '@/proposals/types';
import { useUpdateCall } from '@/proposals/update/useUpdateCall';
import { getCallReadOnlyReason } from '@/proposals/utils';
import { renderFieldOrDash } from '@/table/utils';

import { CallLogoSection } from './CallLogoSection';

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

// Mirrors PROJECT_NAME_PLACEHOLDERS in proposal/enums.py.
const getProjectNamePlaceholders = () => [
  {
    name: 'proposal_name',
    description: translate('Proposal name'),
    example: 'Clinical school',
  },
  {
    name: 'proposal_slug',
    description: translate('Proposal slug'),
    example: 'STORE-001',
  },
  {
    name: 'call_prefix',
    description: translate('Reference code, else call slug'),
    example: 'STORE',
  },
  { name: 'call_slug', description: translate('Call slug'), example: 'store' },
  {
    name: 'call_name',
    description: translate('Call name'),
    example: 'Research storage',
  },
  {
    name: 'round_start',
    description: translate('Round start date'),
    example: '2026-10-02',
  },
  {
    name: 'round_slug',
    description: translate('Round slug'),
    example: 'ORG-STORE-202610',
  },
  {
    name: 'org_slug',
    description: translate('Organization slug'),
    example: 'acme',
  },
  {
    name: 'year',
    description: translate('Year of allocation'),
    example: '2026',
  },
];

export const CallGeneralSection: FC<CallGeneralSectionProps> = (props) => {
  const updateCall = useUpdateCall(props.call, props.refetch);

  return (
    <>
      <CallLogoSection
        call={props.call}
        refetch={props.refetch}
        isReadOnly={props.isReadOnly}
      />
      <PropertyCard
        bordered
        title={translate('General')}
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
          <PropertyList>
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
                <SlugTemplateHelpText
                  placeholders={PROPOSAL_SLUG_PLACEHOLDERS}
                />
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
            <StringEditField
              name="project_name_template"
              label={translate('Project name template')}
              description={
                <>
                  <FormText
                    as="div"
                    variant="muted"
                    className="mt-1.5 leading-7"
                  >
                    {translate(
                      'Name of the project an accepted proposal creates. Leave empty for {default}. Applies to proposals allocated after the change.',
                      { default: <Code>{DEFAULT_PROJECT_NAME_TEMPLATE}</Code> },
                      formatJsxTemplate,
                    )}
                  </FormText>
                  <SlugTemplateHelpText
                    placeholders={getProjectNamePlaceholders()}
                  />
                </>
              }
              descriptionInEditOnly
              disabled={props.isReadOnly}
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
          </PropertyList>
        </EditFieldProvider>
      </PropertyCard>
    </>
  );
};
