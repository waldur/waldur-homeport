import { CheckIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC, useEffect } from 'react';
import { Card, Nav, Tab } from 'react-bootstrap';
import { checklistsAdminRetrieve } from 'waldur-js-client';

import { useSettingsUrlSync } from '@/administration/settings/useSettingsUrlSync';
import { CheckOrX } from '@/core/CheckOrX';
import { UI_STALE_TIME } from '@/core/constants';
import { FormattedHtml } from '@/core/FormattedHtml';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinnerSimple } from '@/core/LoadingSpinner';
import { Tip } from '@/core/Tooltip';
import { getUUID } from '@/core/utils';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { REMOTE_OFFERING_TYPE } from '@/marketplace-remote/constants';
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

const OVERVIEW_TABS = [
  { key: 'basic', title: translate('Basic info') },
  { key: 'links', title: translate('Links') },
  { key: 'media', title: translate('Media') },
  { key: 'access', title: translate('Access & Discovery') },
  { key: 'compliance', title: translate('Compliance') },
  { key: 'identifiers', title: translate('Identifiers') },
];

const AttributeRow: FC<{
  attribute: Attribute;
  offering: OfferingSectionProps['offering'];
  refetch: OfferingSectionProps['refetch'];
}> = ({ attribute, offering, refetch }) => (
  <FormTable.Item
    label={attribute.title}
    value={
      attribute.type === 'html' ? (
        <FormattedHtml html={offering[attribute.key]} />
      ) : attribute.type === 'boolean' ? (
        <CheckOrX value={offering[attribute.key]} />
      ) : attribute.type === 'list' ? (
        renderFieldOrDash(offering[attribute.key]?.join(', '))
      ) : (
        renderFieldOrDash(offering[attribute.key])
      )
    }
    description={attribute.description}
    actions={
      <>
        {offering.type === REMOTE_OFFERING_TYPE ? (
          <Tip
            label={translate('Field is synchronised from the remote offering')}
            id={`remote-offering-tip-${attribute.key}`}
          >
            <EditOverviewButton
              offering={offering}
              refetch={refetch}
              attribute={attribute}
              disabled={true}
            />
          </Tip>
        ) : (
          <EditOverviewButton
            offering={offering}
            refetch={refetch}
            attribute={attribute}
          />
        )}
      </>
    }
    warnTooltip={attribute.required && attribute.requiredMsg}
  />
);

export const OverviewSection: FC<OfferingSectionProps> = (props) => {
  const { activeKey, handleSelect, defaultActiveKey } = useSettingsUrlSync(
    OVERVIEW_TABS,
    'section',
  );

  const {
    isLoading,
    error,
    data: checklist,
    refetch,
  } = useQuery({
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
    refetch();
  }, [props.offering.compliance_checklist, refetch]);

  return (
    <Card className="card-bordered">
      <Card.Body>
        <Tab.Container
          defaultActiveKey={defaultActiveKey}
          activeKey={activeKey}
          onSelect={handleSelect}
        >
          <Nav variant="tabs" className="nav-line-tabs mb-5">
            {OVERVIEW_TABS.map((tab) => (
              <Nav.Item key={tab.key}>
                <Nav.Link eventKey={tab.key}>{tab.title}</Nav.Link>
              </Nav.Item>
            ))}
          </Nav>
          <Tab.Content>
            {/* Basic info tab */}
            <Tab.Pane eventKey="basic" unmountOnExit>
              <FormTable>
                {basicInfoAttributes.map((attribute) => (
                  <AttributeRow
                    key={attribute.key}
                    attribute={attribute}
                    offering={props.offering}
                    refetch={props.refetch}
                  />
                ))}
                <FormTable.Item
                  label={translate('Getting started instructions')}
                  value={<CheckOrX value={props.offering.getting_started} />}
                  description={translate(
                    'Provide steps to help users begin using the offering.',
                  )}
                  actions={
                    <EditGettingStartedButton
                      offering={props.offering}
                      refetch={props.refetch}
                    />
                  }
                />
              </FormTable>
            </Tab.Pane>

            {/* Links tab */}
            <Tab.Pane eventKey="links" unmountOnExit>
              <FormTable>
                {linksAttributes.map((attribute) => (
                  <AttributeRow
                    key={attribute.key}
                    attribute={attribute}
                    offering={props.offering}
                    refetch={props.refetch}
                  />
                ))}
              </FormTable>
            </Tab.Pane>

            {/* Media tab */}
            <Tab.Pane eventKey="media" unmountOnExit>
              <FormTable>
                <FormTable.Item
                  label={translate('Logo')}
                  value={<CheckOrX value={props.offering.thumbnail} />}
                  description={translate(
                    'Upload an image to represent the offering visually.',
                  )}
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
                  value={<CheckOrX value={props.offering.image} />}
                  description={translate(
                    'Upload a background image for the offering.',
                  )}
                  actions={
                    <OfferingMediaButton
                      offering={props.offering}
                      refetch={props.refetch}
                      mediaType="image"
                    />
                  }
                />
              </FormTable>
            </Tab.Pane>

            {/* Access & Discovery tab */}
            <Tab.Pane eventKey="access" unmountOnExit>
              <FormTable>
                <FormTable.Item
                  label={translate('Location')}
                  value={
                    <CheckOrX
                      value={
                        props.offering.latitude && props.offering.longitude
                      }
                    />
                  }
                  description={translate(
                    'Specify where the offering is hosted.',
                  )}
                  actions={
                    <OfferingLocationButton
                      offering={props.offering}
                      refetch={props.refetch}
                    />
                  }
                />
                <FormTable.Item
                  label={translate('Tags')}
                  value={
                    props.offering.tags?.length > 0
                      ? props.offering.tags.map((tag) => tag.name).join(', ')
                      : 'N/A'
                  }
                  description={translate(
                    'Add tags to help users find this offering more easily.',
                  )}
                  actions={
                    <EditTagsButton
                      offering={props.offering}
                      refetch={props.refetch}
                    />
                  }
                />
                <FormTable.Item
                  label={translate('Service profile')}
                  value={
                    (props.offering as any).profile_name ||
                    translate('— None —')
                  }
                  description={translate(
                    'Bind to a profile to use a centrally-managed role catalog (staff-only).',
                  )}
                  actions={
                    <EditOfferingProfileButton
                      offering={props.offering}
                      refetch={props.refetch}
                    />
                  }
                />
              </FormTable>
            </Tab.Pane>

            {/* Compliance tab */}
            <Tab.Pane eventKey="compliance" unmountOnExit>
              <FormTable>
                <FormTable.Item
                  label={translate('Access policies')}
                  value={
                    props.offering.organization_groups?.length > 0
                      ? props.offering.organization_groups
                          .map(({ name }) => name)
                          .join(', ')
                      : 'N/A'
                  }
                  description={translate(
                    'Define the organization groups that are allowed to access the offering.',
                  )}
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
                    props.offering.has_compliance_requirements ? (
                      <>
                        {!checklist && (
                          <CheckIcon weight="bold" className="text-info" />
                        )}
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
                    ) : (
                      'N/A'
                    )
                  }
                  actions={
                    <EditChecklistButton
                      offering={props.offering}
                      checklist={checklist}
                      refetch={props.refetch}
                    />
                  }
                />
              </FormTable>
            </Tab.Pane>

            {/* Identifiers tab */}
            <Tab.Pane eventKey="identifiers" unmountOnExit>
              <FormTable>
                <FormTable.Item
                  label={translate('UUID')}
                  value={props.offering.uuid}
                />
                {identifiersAttributes.map((attribute) => (
                  <AttributeRow
                    key={attribute.key}
                    attribute={attribute}
                    offering={props.offering}
                    refetch={props.refetch}
                  />
                ))}
              </FormTable>
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </Card.Body>
    </Card>
  );
};
