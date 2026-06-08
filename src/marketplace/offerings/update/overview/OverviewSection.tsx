import { CheckIcon } from '@phosphor-icons/react';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { FC, ReactNode, useEffect, useMemo, useState } from 'react';
import { Card, Nav, Tab } from 'react-bootstrap';
import { Checklist, checklistsAdminRetrieve, Offering } from 'waldur-js-client';

import { useSettingsUrlSync } from '@/administration/settings/useSettingsUrlSync';
import { Badge } from '@/core/Badge';
import { CheckOrX } from '@/core/CheckOrX';
import { UI_STALE_TIME } from '@/core/constants';
import { FormattedHtml } from '@/core/FormattedHtml';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinnerSimple } from '@/core/LoadingSpinner';
import { Tip } from '@/core/Tooltip';
import { getUUID } from '@/core/utils';
import FormTable from '@/form/FormTable';
import { useFieldSearch } from '@/form/useFieldSearch';
import { translate } from '@/i18n';
import { REMOTE_OFFERING_TYPE } from '@/marketplace-remote/constants';
import { NoResult } from '@/navigation/header/search/NoResult';
import { TableQuery } from '@/table/TableQuery';
import { renderFieldOrDash } from '@/table/utils';

import { OfferingSectionProps } from '../types';

import { EditChecklistButton } from './EditChecklistButton';
import { EditGettingStartedButton } from './EditGettingStartedButton';
import { EditOfferingProfileButton } from './EditOfferingProfileButton';
import { EditOverviewButton } from './EditOverviewButton';
import { EditTagsButton } from './EditTagsButton';
import { OfferingLocationButton } from './OfferingLocationButton';
import { OfferingMediaButton } from './OfferingMediaButton';
import { SetAccessPolicyButton } from './SetAccessPolicyButton';
import { Attribute } from './types';

interface RenderCtx {
  refetch(): void;
  checklistQuery: UseQueryResult<Checklist | null>;
}

interface OverviewItem {
  key: string;
  title: string;
  description?: string;
  warnTooltip?: string;
  renderValue(offering: Offering, ctx: RenderCtx): ReactNode;
  renderActions?(offering: Offering, ctx: RenderCtx): ReactNode;
}

const basicInfoAttributes: Attribute[] = [
  {
    key: 'name',
    title: translate('Name'),
    type: 'string',
    maxLength: 150,
    required: true,
    description: translate(
      "Enter the offering's name as it will appear to users.",
    ),
    requiredMsg: translate('Offering name is required.'),
  },
  {
    key: 'description',
    title: translate('Description'),
    type: 'html',
    description: translate('Provide a brief overview of the offering.'),
  },
  {
    key: 'full_description',
    title: translate('Full description'),
    type: 'html',
    description: translate(
      'Add a detailed explanation of what the offering includes.',
    ),
  },
];

const linksAttributes: Attribute[] = [
  {
    key: 'privacy_policy_link',
    title: translate('Privacy policy link'),
    type: 'string',
    maxLength: 200,
    description: translate(
      'Add a link to your privacy policy for this offering.',
    ),
  },
  {
    key: 'access_url',
    title: translate('Access URL'),
    type: 'string',
    maxLength: 200,
    description: translate(
      'Provide the URL users will use to access the offering.',
    ),
  },
  {
    key: 'documentation_url',
    title: translate('Documentation URL'),
    type: 'string',
    maxLength: 200,
    description: translate('Link to the documentation for this offering.'),
  },
  {
    key: 'helpdesk_url',
    title: translate('Helpdesk URL'),
    type: 'string',
    maxLength: 200,
    description: translate(
      'Link to the helpdesk or support portal for this offering.',
    ),
  },
];

const identifiersAttributes: Attribute[] = [
  {
    key: 'backend_id',
    title: translate('Backend ID'),
    type: 'string',
    description: translate(
      'Unique identifier for the backend system associated with this offering.',
    ),
  },
  {
    key: 'slug',
    title: translate('Slug'),
    type: 'string',
    maxLength: 50,
    description: translate(
      'A POSIX-friendly unique identifier for the offering.',
    ),
  },
];

const renderAttributeValue = (
  attribute: Attribute,
  offering: Offering,
): ReactNode => {
  if (attribute.type === 'html') {
    return <FormattedHtml html={offering[attribute.key]} />;
  }
  if (attribute.type === 'boolean') {
    return <CheckOrX value={offering[attribute.key]} />;
  }
  if (attribute.type === 'list') {
    return renderFieldOrDash(offering[attribute.key]?.join(', '));
  }
  return renderFieldOrDash(offering[attribute.key]);
};

const renderAttributeActions = (
  attribute: Attribute,
  offering: Offering,
  ctx: RenderCtx,
): ReactNode =>
  offering.type === REMOTE_OFFERING_TYPE ? (
    <Tip
      label={translate('Field is synchronised from the remote offering')}
      id={`remote-offering-tip-${attribute.key}`}
    >
      <EditOverviewButton
        offering={offering}
        refetch={ctx.refetch}
        attribute={attribute}
        disabled={true}
      />
    </Tip>
  ) : (
    <EditOverviewButton
      offering={offering}
      refetch={ctx.refetch}
      attribute={attribute}
    />
  );

const fromAttribute = (attribute: Attribute): OverviewItem => ({
  key: attribute.key,
  title: attribute.title,
  description: attribute.description,
  warnTooltip:
    attribute.required && attribute.requiredMsg
      ? attribute.requiredMsg
      : undefined,
  renderValue: (offering) => renderAttributeValue(attribute, offering),
  renderActions: (offering, ctx) =>
    renderAttributeActions(attribute, offering, ctx),
});

const basicItems: OverviewItem[] = [
  ...basicInfoAttributes.map(fromAttribute),
  {
    key: 'getting_started',
    title: translate('Getting started instructions'),
    description: translate(
      'Provide steps to help users begin using the offering.',
    ),
    renderValue: (offering) => <CheckOrX value={offering.getting_started} />,
    renderActions: (offering, ctx) => (
      <EditGettingStartedButton offering={offering} refetch={ctx.refetch} />
    ),
  },
];

const linksItems: OverviewItem[] = linksAttributes.map(fromAttribute);

const mediaItems: OverviewItem[] = [
  {
    key: 'thumbnail',
    title: translate('Logo'),
    description: translate(
      'Upload an image to represent the offering visually.',
    ),
    renderValue: (offering) => <CheckOrX value={offering.thumbnail} />,
    renderActions: (offering, ctx) => (
      <OfferingMediaButton
        offering={offering}
        refetch={ctx.refetch}
        mediaType="thumbnail"
      />
    ),
  },
  {
    key: 'image',
    title: translate('Image'),
    description: translate('Upload a background image for the offering.'),
    renderValue: (offering) => <CheckOrX value={offering.image} />,
    renderActions: (offering, ctx) => (
      <OfferingMediaButton
        offering={offering}
        refetch={ctx.refetch}
        mediaType="image"
      />
    ),
  },
];

const accessItems: OverviewItem[] = [
  {
    key: 'location',
    title: translate('Location'),
    description: translate('Specify where the offering is hosted.'),
    renderValue: (offering) => (
      <CheckOrX value={offering.latitude && offering.longitude} />
    ),
    renderActions: (offering, ctx) => (
      <OfferingLocationButton offering={offering} refetch={ctx.refetch} />
    ),
  },
  {
    key: 'tags',
    title: translate('Tags'),
    description: translate(
      'Add tags to help users find this offering more easily.',
    ),
    renderValue: (offering) =>
      offering.tags?.length > 0
        ? offering.tags.map((tag) => tag.name).join(', ')
        : 'N/A',
    renderActions: (offering, ctx) => (
      <EditTagsButton offering={offering} refetch={ctx.refetch} />
    ),
  },
  {
    key: 'profile',
    title: translate('Service profile'),
    description: translate(
      'Bind to a profile to use a centrally-managed role catalog (staff-only).',
    ),
    renderValue: (offering) =>
      (offering as any).profile_name || translate('— None —'),
    renderActions: (offering, ctx) => (
      <EditOfferingProfileButton offering={offering} refetch={ctx.refetch} />
    ),
  },
];

const complianceItems: OverviewItem[] = [
  {
    key: 'access_policies',
    title: translate('Access policies'),
    description: translate(
      'Define the organization groups that are allowed to access the offering.',
    ),
    renderValue: (offering) =>
      offering.organization_groups?.length > 0
        ? offering.organization_groups.map(({ name }) => name).join(', ')
        : 'N/A',
    renderActions: (offering, ctx) => (
      <SetAccessPolicyButton offering={offering} refetch={ctx.refetch} />
    ),
  },
  {
    key: 'compliance_checklist',
    title: translate('Compliance checklist'),
    renderValue: (offering, ctx) => {
      if (!offering.has_compliance_requirements) {
        return 'N/A';
      }
      const { data: checklist, isLoading, error, refetch } = ctx.checklistQuery;
      return (
        <>
          {!checklist && <CheckIcon weight="bold" className="text-info" />}
          {isLoading ? (
            <LoadingSpinnerSimple />
          ) : error ? (
            <LoadingErred
              loadData={refetch}
              className="d-inline-flex flex-center gap-4 ms-4"
            />
          ) : checklist ? (
            <>
              {checklist.name}
              <span className="text-muted ms-2">
                (
                {translate('{count} questions', {
                  count: checklist.questions_count,
                })}
                )
              </span>
            </>
          ) : null}
        </>
      );
    },
    renderActions: (offering, ctx) => (
      <EditChecklistButton
        offering={offering}
        checklist={ctx.checklistQuery.data ?? undefined}
        refetch={ctx.refetch}
      />
    ),
  },
];

const identifiersItems: OverviewItem[] = [
  {
    key: 'uuid',
    title: translate('UUID'),
    renderValue: (offering) => offering.uuid,
  },
  ...identifiersAttributes.map(fromAttribute),
];

const OVERVIEW_TABS = [
  { key: 'basic', title: translate('Basic info') },
  { key: 'links', title: translate('Links') },
  { key: 'media', title: translate('Media') },
  { key: 'access', title: translate('Access & Discovery') },
  { key: 'compliance', title: translate('Compliance') },
  { key: 'identifiers', title: translate('Identifiers') },
];

const OverviewItemRow: FC<{
  item: OverviewItem;
  offering: Offering;
  ctx: RenderCtx;
}> = ({ item, offering, ctx }) => (
  <FormTable.Item
    label={item.title}
    description={item.description}
    warnTooltip={item.warnTooltip}
    value={item.renderValue(offering, ctx)}
    actions={item.renderActions ? item.renderActions(offering, ctx) : undefined}
  />
);

export const OverviewSection: FC<OfferingSectionProps> = (props) => {
  const { activeKey, handleSelect, defaultActiveKey } = useSettingsUrlSync(
    OVERVIEW_TABS,
    'section',
  );

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

  const ctx: RenderCtx = useMemo(
    () => ({ refetch: props.refetch, checklistQuery }),
    [props.refetch, checklistQuery],
  );

  const [query, setQuery] = useState('');

  const filteredBasic = useFieldSearch(basicItems, query);
  const filteredLinks = useFieldSearch(linksItems, query);
  const filteredMedia = useFieldSearch(mediaItems, query);
  const filteredAccess = useFieldSearch(accessItems, query);
  const filteredCompliance = useFieldSearch(complianceItems, query);
  const filteredIdentifiers = useFieldSearch(identifiersItems, query);

  const filteredByKey: Record<string, OverviewItem[]> = {
    basic: filteredBasic,
    links: filteredLinks,
    media: filteredMedia,
    access: filteredAccess,
    compliance: filteredCompliance,
    identifiers: filteredIdentifiers,
  };

  const hasQuery = query.trim().length > 0;

  useEffect(() => {
    if (!hasQuery) return;
    if ((filteredByKey[activeKey]?.length ?? 0) > 0) return;
    const next = OVERVIEW_TABS.find(
      (tab) => (filteredByKey[tab.key]?.length ?? 0) > 0,
    );
    if (next && next.key !== activeKey) {
      handleSelect(next.key);
    }
  }, [
    hasQuery,
    activeKey,
    filteredBasic,
    filteredLinks,
    filteredMedia,
    filteredAccess,
    filteredCompliance,
    filteredIdentifiers,
  ]);

  return (
    <Card className="card-bordered">
      <Card.Body>
        <Tab.Container
          defaultActiveKey={defaultActiveKey}
          activeKey={activeKey}
          onSelect={handleSelect}
        >
          <div className="d-flex justify-content-end mb-3">
            <TableQuery query={query} setQuery={setQuery} />
          </div>
          <Nav variant="tabs" className="nav-line-tabs mb-5">
            {OVERVIEW_TABS.map((tab) => {
              const count = filteredByKey[tab.key]?.length ?? 0;
              const disabled = hasQuery && count === 0;
              return (
                <Nav.Item key={tab.key}>
                  <Nav.Link
                    eventKey={tab.key}
                    disabled={disabled}
                    className={disabled ? 'text-muted' : ''}
                  >
                    {tab.title}
                    {hasQuery && (
                      <Badge
                        variant="secondary"
                        size="sm"
                        light
                        className="ms-2"
                      >
                        {count}
                      </Badge>
                    )}
                  </Nav.Link>
                </Nav.Item>
              );
            })}
          </Nav>
          <Tab.Content>
            {OVERVIEW_TABS.map((tab) => {
              const items = filteredByKey[tab.key];
              return (
                <Tab.Pane key={tab.key} eventKey={tab.key} unmountOnExit>
                  {items.length > 0 ? (
                    <FormTable>
                      {items.map((item) => (
                        <OverviewItemRow
                          key={item.key}
                          item={item}
                          offering={props.offering}
                          ctx={ctx}
                        />
                      ))}
                    </FormTable>
                  ) : (
                    <NoResult
                      title={translate('No results found')}
                      message={translate(
                        'No matching fields. Try a different search term.',
                      )}
                      callback={() => setQuery('')}
                      buttonTitle={translate('Clear search')}
                    />
                  )}
                </Tab.Pane>
              );
            })}
          </Tab.Content>
        </Tab.Container>
      </Card.Body>
    </Card>
  );
};
