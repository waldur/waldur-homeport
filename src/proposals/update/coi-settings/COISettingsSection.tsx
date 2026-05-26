import { InfoIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { FC, useCallback } from 'react';
import { Card, Nav, Tab } from 'react-bootstrap';
import {
  CallCoiConfiguration,
  proposalProtectedCallsCoiConfigurationRetrieve,
} from 'waldur-js-client';

import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { Tip } from '@/core/Tooltip';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { Call } from '@/proposals/types';

import { COISummaryButton } from './COISummaryButton';
import { EditCOISettingButton } from './EditCOISettingButton';

interface COISettingsSectionProps {
  call: Call;
  refetch: () => void;
  isReadOnly?: boolean;
}

// Labels for proposal disclosure levels
const DISCLOSURE_LEVEL_LABELS: Record<string, string> = {
  titles_only: translate('Titles only'),
  titles_and_summaries: translate('Titles and summaries'),
  full_details: translate('Full proposal details'),
};

const fetchCallCoiConfiguration = async (callUuid: string) => {
  const response = await proposalProtectedCallsCoiConfigurationRetrieve({
    path: { uuid: callUuid },
  });
  return response.data;
};

// COI type labels for display
const COI_TYPE_LABELS: Record<string, string> = {
  INST_SAME: translate('Same institution'),
  FIN_DIRECT: translate('Direct financial interest'),
  REL_FAMILY: translate('Family relationship'),
  ROLE_NAMED: translate('Named on proposal'),
  COLLAB_ACTIVE: translate('Active collaboration'),
  REL_MENTOR: translate('Mentor/mentee relationship'),
  REL_SUPERVISOR: translate('Supervisor relationship'),
  COAUTH_RECENT: translate('Recent co-authorship'),
  INST_DEPT: translate('Same department'),
  INST_FORMER: translate('Former institution'),
  ROLE_CONF: translate('Conference organizer'),
  COLLAB_GRANT: translate('Grant collaboration'),
  REL_EDITORIAL: translate('Editorial relationship'),
  COMPET: translate('Competitor'),
  COAUTH_OLD: translate('Distant co-authorship'),
  INST_CONSORT: translate('Consortium membership'),
  CONF_ATTEND: translate('Conference participation'),
  SOC_MEMBER: translate('Professional society'),
};

const formatTypeList = (types: string[] | undefined) => {
  if (!types?.length) return translate('Not configured');
  return types.map((t) => COI_TYPE_LABELS[t] || t).join(', ');
};

const detectionRows = [
  {
    label: translate('Co-authorship lookback'),
    key: 'coauthorship_lookback_years',
    getValue: (config: CallCoiConfiguration) =>
      translate('{n} years', { n: config?.coauthorship_lookback_years ?? 3 }),
    title: translate('Edit co-authorship lookback period'),
    description: translate(
      'Number of years to search for shared publications between reviewers and proposal team members',
    ),
  },
  {
    label: translate('Co-authorship threshold'),
    key: 'coauthorship_threshold_papers',
    getValue: (config: CallCoiConfiguration) =>
      translate('{n} shared papers', {
        n: config?.coauthorship_threshold_papers ?? 1,
      }),
    title: translate('Edit co-authorship threshold'),
    description: translate(
      'Minimum number of shared publications required to trigger a co-authorship conflict',
    ),
  },
  {
    label: translate('Institutional lookback'),
    key: 'institutional_lookback_years',
    getValue: (config: CallCoiConfiguration) =>
      translate('{n} years', { n: config?.institutional_lookback_years ?? 2 }),
    title: translate('Edit institutional lookback period'),
    description: translate(
      'Number of years to consider past institutional affiliations when detecting conflicts',
    ),
  },
  {
    label: translate('Detect same department'),
    key: 'include_same_department',
    getValue: (config: CallCoiConfiguration) =>
      config?.include_same_department ? translate('Yes') : translate('No'),
    title: translate('Edit same department detection'),
    description: translate(
      'Flag a conflict when reviewer and proposal team member are in the same department',
    ),
  },
  {
    label: translate('Detect same institution'),
    key: 'include_same_institution',
    getValue: (config: CallCoiConfiguration) =>
      config?.include_same_institution ? translate('Yes') : translate('No'),
    title: translate('Edit same institution detection'),
    description: translate(
      'Flag a conflict when reviewer and proposal team member are at the same institution',
    ),
  },
];

const automationRows = [
  {
    label: translate('Auto-detect co-authorship'),
    key: 'auto_detect_coauthorship',
    getValue: (config: CallCoiConfiguration) =>
      config?.auto_detect_coauthorship
        ? translate('Enabled')
        : translate('Disabled'),
    title: translate('Edit auto-detect co-authorship'),
    description: translate(
      'Automatically scan publication records to identify co-authorship relationships',
    ),
  },
  {
    label: translate('Auto-detect institutional'),
    key: 'auto_detect_institutional',
    getValue: (config: CallCoiConfiguration) =>
      config?.auto_detect_institutional
        ? translate('Enabled')
        : translate('Disabled'),
    title: translate('Edit auto-detect institutional affiliation'),
    description: translate(
      'Automatically compare institutional affiliations between reviewers and proposal teams',
    ),
  },
  {
    label: translate('Auto-detect named personnel'),
    key: 'auto_detect_named_personnel',
    getValue: (config: CallCoiConfiguration) =>
      config?.auto_detect_named_personnel
        ? translate('Enabled')
        : translate('Disabled'),
    title: translate('Edit auto-detect named personnel'),
    description: translate(
      'Automatically check if a reviewer is named as personnel on any proposal',
    ),
  },
];

const typeRows = [
  {
    label: translate('Types requiring recusal'),
    key: 'recusal_required_types',
    getValue: (config: CallCoiConfiguration) =>
      formatTypeList(config?.recusal_required_types),
    title: translate('Edit types requiring recusal'),
    description: translate(
      'Conflict types that require the reviewer to withdraw from reviewing the proposal entirely',
    ),
  },
  {
    label: translate('Types allowing management plan'),
    key: 'management_allowed_types',
    getValue: (config: CallCoiConfiguration) =>
      formatTypeList(config?.management_allowed_types),
    title: translate('Edit types allowing management plan'),
    description: translate(
      'Conflict types where the reviewer may continue with an approved management plan',
    ),
  },
  {
    label: translate('Types requiring disclosure only'),
    key: 'disclosure_only_types',
    getValue: (config: CallCoiConfiguration) =>
      formatTypeList(config?.disclosure_only_types),
    title: translate('Edit types requiring disclosure only'),
    description: translate(
      'Conflict types that only need to be disclosed but do not require further action',
    ),
  },
];

const invitationRows = [
  {
    label: translate('Proposal disclosure level'),
    key: 'invitation_proposal_disclosure',
    getValue: (config: CallCoiConfiguration) =>
      DISCLOSURE_LEVEL_LABELS[config?.invitation_proposal_disclosure ?? ''] ||
      translate('Titles only'),
    title: translate('Edit proposal disclosure level'),
    description: translate(
      'Controls how much proposal information is disclosed to reviewers in invitations. This helps reviewers assess potential conflicts of interest before accepting.',
    ),
  },
];

const tabs = [
  { key: 'detection', title: translate('Detection'), rows: detectionRows },
  { key: 'automation', title: translate('Automation'), rows: automationRows },
  { key: 'types', title: translate('Type handling'), rows: typeRows },
  { key: 'invitations', title: translate('Invitations'), rows: invitationRows },
];

const DEFAULT_COI_TAB = 'detection';

export const COISettingsSection: FC<COISettingsSectionProps> = ({
  call,
  isReadOnly,
}) => {
  const { state, params } = useCurrentStateAndParams();
  const router = useRouter();

  // Get active tab from URL or default to 'detection'
  const activeTab = params.coi_tab || DEFAULT_COI_TAB;

  const handleTabSelect = useCallback(
    (key: string | null) => {
      if (key) {
        router.stateService.go(state.name, { ...params, coi_tab: key });
      }
    },
    [router, state, params],
  );

  const {
    data: config,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['coiConfiguration', call.uuid],
    queryFn: () => fetchCallCoiConfiguration(call.uuid),
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <LoadingErred
        message={translate('Failed to load COI configuration.')}
        loadData={refetch}
      />
    );
  }

  return (
    <Card className="card-bordered">
      <Card.Header>
        <Card.Title>
          <h3>
            {translate('COI configuration')}{' '}
            <Tip
              id="coi-tooltip"
              label={translate('Conflict of Interest')}
              body={translate(
                'COI settings control how conflicts of interest between reviewers and proposals are detected and handled. This includes co-authorship, institutional affiliations, and other relationships that may affect impartial review.',
              )}
              autoWidth
            >
              <InfoIcon className="text-muted" weight="bold" />
            </Tip>
          </h3>
        </Card.Title>
        <div className="card-toolbar">
          <COISummaryButton config={config} />
        </div>
      </Card.Header>
      <Card.Body>
        <Tab.Container activeKey={activeTab} onSelect={handleTabSelect}>
          <Nav variant="tabs" className="nav-line-tabs mb-5">
            {tabs.map((tab) => (
              <Nav.Item key={tab.key}>
                <Nav.Link eventKey={tab.key}>{tab.title}</Nav.Link>
              </Nav.Item>
            ))}
          </Nav>
          <Tab.Content>
            {tabs.map((tab) => (
              <Tab.Pane key={tab.key} eventKey={tab.key} unmountOnExit>
                <FormTable>
                  {tab.rows.map((row) => (
                    <FormTable.Item
                      key={row.key}
                      label={row.label}
                      description={row.description}
                      value={row.getValue(config)}
                      actions={
                        <EditCOISettingButton
                          call={call}
                          name={row.key}
                          title={row.title}
                          refetch={refetch}
                          disabled={isReadOnly}
                        />
                      }
                    />
                  ))}
                </FormTable>
              </Tab.Pane>
            ))}
          </Tab.Content>
        </Tab.Container>
      </Card.Body>
    </Card>
  );
};
