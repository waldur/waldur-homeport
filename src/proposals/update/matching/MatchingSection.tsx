import { InfoIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { FC, useCallback, useMemo } from 'react';
import { Card, Nav, Tab } from 'react-bootstrap';
import { proposalProtectedCallsMatchingConfigurationRetrieve } from 'waldur-js-client';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { Tip } from '@waldur/core/Tooltip';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { Call } from '@waldur/proposals/types';

import { EditMatchingSettingButton } from './EditMatchingSettingButton';
import { MatchingSummaryButton } from './MatchingSummaryButton';
import {
  MatchingConfig,
  AFFINITY_METHOD_LABELS,
  ALGORITHM_LABELS,
} from './types';

interface MatchingSectionProps {
  call: Call;
  refetch: () => void;
}

const DEFAULT_CONFIG: MatchingConfig = {
  affinity_method: 'combined',
  keyword_weight: 0.4,
  text_weight: 0.6,
  min_reviewers_per_proposal: 3,
  max_reviewers_per_proposal: 5,
  max_proposals_per_reviewer: 10,
  algorithm: 'minmax',
};

const fetchMatchingConfig = async (
  callUuid: string,
): Promise<MatchingConfig> => {
  try {
    const response = await proposalProtectedCallsMatchingConfigurationRetrieve({
      path: { uuid: callUuid },
    });
    return response.data as unknown as MatchingConfig;
  } catch {
    // Return default config if endpoint not available yet
    return DEFAULT_CONFIG;
  }
};

// Row definitions for affinity calculation tab
const affinityRows = [
  {
    label: translate('Affinity method'),
    key: 'affinity_method',
    getValue: (config: MatchingConfig) =>
      AFFINITY_METHOD_LABELS[config?.affinity_method] ||
      config?.affinity_method ||
      translate('Combined'),
    title: translate('Edit affinity method'),
    description: translate(
      'Algorithm used to compute similarity between reviewer expertise and proposal content',
    ),
  },
  {
    label: translate('Keyword weight'),
    key: 'keyword_weight',
    getValue: (config: MatchingConfig) =>
      (config?.keyword_weight ?? 0.4).toFixed(2),
    title: translate('Edit keyword weight'),
    description: translate(
      'Weight given to keyword matching in the affinity calculation (0-1)',
    ),
  },
  {
    label: translate('Text weight'),
    key: 'text_weight',
    getValue: (config: MatchingConfig) =>
      (config?.text_weight ?? 0.6).toFixed(2),
    title: translate('Edit text weight'),
    description: translate(
      'Weight given to text similarity (TF-IDF) in the affinity calculation (0-1)',
    ),
  },
];

// Row definitions for constraints tab
const constraintRows = [
  {
    label: translate('Min reviewers per proposal'),
    key: 'min_reviewers_per_proposal',
    getValue: (config: MatchingConfig) =>
      String(config?.min_reviewers_per_proposal ?? 2),
    title: translate('Edit minimum reviewers per proposal'),
    description: translate(
      'Minimum number of reviewers that must be assigned to each proposal',
    ),
  },
  {
    label: translate('Max reviewers per proposal'),
    key: 'max_reviewers_per_proposal',
    getValue: (config: MatchingConfig) =>
      String(config?.max_reviewers_per_proposal ?? 3),
    title: translate('Edit maximum reviewers per proposal'),
    description: translate(
      'Maximum number of reviewers that can be assigned to each proposal',
    ),
  },
  {
    label: translate('Max proposals per reviewer'),
    key: 'max_proposals_per_reviewer',
    getValue: (config: MatchingConfig) =>
      String(config?.max_proposals_per_reviewer ?? 5),
    title: translate('Edit maximum proposals per reviewer'),
    description: translate(
      'Maximum number of proposals a single reviewer can be assigned',
    ),
  },
  {
    label: translate('Assignment algorithm'),
    key: 'algorithm',
    getValue: (config: MatchingConfig) =>
      ALGORITHM_LABELS[config?.algorithm] ||
      config?.algorithm ||
      translate('MinMax (balanced load)'),
    title: translate('Edit assignment algorithm'),
    description: translate(
      'Algorithm used to assign reviewers to proposals based on affinity scores',
    ),
  },
];

const tabs = [
  {
    key: 'affinity',
    title: translate('Affinity calculation'),
    rows: affinityRows,
  },
  { key: 'constraints', title: translate('Constraints'), rows: constraintRows },
];

const DEFAULT_MATCHING_TAB = 'affinity';

export const MatchingSection: FC<MatchingSectionProps> = ({
  call,
  refetch,
}) => {
  const { state, params } = useCurrentStateAndParams();
  const router = useRouter();

  // Get active tab from URL or default to 'affinity'
  const activeTab = useMemo(
    () => params.matching_tab || DEFAULT_MATCHING_TAB,
    [params.matching_tab],
  );

  const handleTabSelect = useCallback(
    (key: string | null) => {
      if (key) {
        router.stateService.go(state.name, { ...params, matching_tab: key });
      }
    },
    [router, state, params],
  );

  // Fetch matching configuration
  const {
    data: config,
    isLoading,
    error,
    refetch: refetchConfig,
  } = useQuery<MatchingConfig>({
    queryKey: ['matching-config', call.uuid],
    queryFn: async () => {
      try {
        return await fetchMatchingConfig(call.uuid);
      } catch {
        return DEFAULT_CONFIG;
      }
    },
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <LoadingErred
        message={translate('Failed to load matching configuration.')}
        loadData={refetchConfig}
      />
    );
  }

  const handleRefetch = () => {
    refetchConfig();
    refetch();
  };

  return (
    <Card className="card-bordered">
      <Card.Header>
        <Card.Title>
          <h3>
            {translate('Matching settings')}{' '}
            <Tip
              id="matching-tooltip"
              label={translate('Reviewer-Proposal Matching')}
              body={translate(
                'Configure how reviewers are matched to proposals based on expertise. Includes affinity calculation weights and assignment constraints.',
              )}
              autoWidth
            >
              <InfoIcon className="text-muted" weight="bold" />
            </Tip>
          </h3>
        </Card.Title>
        <div className="card-toolbar">
          <MatchingSummaryButton config={config || DEFAULT_CONFIG} />
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
            {/* Affinity calculation tab */}
            <Tab.Pane eventKey="affinity" unmountOnExit>
              <FormTable>
                {affinityRows.map((row) => (
                  <FormTable.Item
                    key={row.key}
                    label={row.label}
                    description={row.description}
                    value={row.getValue(config || DEFAULT_CONFIG)}
                    actions={
                      <EditMatchingSettingButton
                        call={call}
                        name={row.key}
                        title={row.title}
                        refetch={handleRefetch}
                      />
                    }
                  />
                ))}
              </FormTable>
              <div className="alert alert-info mt-4 d-flex align-items-center gap-2">
                <InfoIcon size={20} weight="bold" />
                <span>
                  {translate(
                    'Weights should sum to 1.0 for optimal results. Current sum: {sum}',
                    {
                      sum: (
                        (config?.keyword_weight ?? 0.4) +
                        (config?.text_weight ?? 0.6)
                      ).toFixed(2),
                    },
                  )}
                </span>
              </div>
            </Tab.Pane>

            {/* Constraints tab */}
            <Tab.Pane eventKey="constraints" unmountOnExit>
              <FormTable>
                {constraintRows.map((row) => (
                  <FormTable.Item
                    key={row.key}
                    label={row.label}
                    description={row.description}
                    value={row.getValue(config || DEFAULT_CONFIG)}
                    actions={
                      <EditMatchingSettingButton
                        call={call}
                        name={row.key}
                        title={row.title}
                        refetch={handleRefetch}
                      />
                    }
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
