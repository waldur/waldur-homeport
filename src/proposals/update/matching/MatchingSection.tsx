import { InfoIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { proposalProtectedCallsMatchingConfigurationRetrieve } from 'waldur-js-client';

import {
  AlertItem,
  PropertyItem,
  PropertyList,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Tooltip,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardToolbar,
} from 'waldur-ui';

import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { useUrlTab } from '@/navigation/useUrlTab';
import { Call } from '@/proposals/types';

import { EditMatchingSettingButton } from './EditMatchingSettingButton';
import { MatchingSummaryButton } from './MatchingSummaryButton';
import { ResponseWindowSettings } from './ResponseWindowSettings';
import {
  MatchingConfig,
  AFFINITY_METHOD_LABELS,
  ALGORITHM_LABELS,
} from './types';

interface MatchingSectionProps {
  call: Call;
  refetch: () => void;
  isReadOnly?: boolean;
}

// The backend model defaults, shown while a call has no configuration saved.
export const DEFAULT_CONFIG: MatchingConfig = {
  affinity_method: 'combined',
  keyword_weight: 0.4,
  text_weight: 0.6,
  min_reviewers_per_proposal: 3,
  max_reviewers_per_proposal: 5,
  max_proposals_per_reviewer: 10,
  algorithm: 'minmax',
  min_affinity_threshold: 0.1,
};

const fetchMatchingConfig = async (
  callUuid: string,
): Promise<MatchingConfig> => {
  try {
    const response = await proposalProtectedCallsMatchingConfigurationRetrieve({
      path: { uuid: callUuid },
    });
    return response.data;
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
export const constraintRows = [
  {
    label: translate('Min reviewers per proposal'),
    key: 'min_reviewers_per_proposal',
    getValue: (config: MatchingConfig) =>
      String(
        config?.min_reviewers_per_proposal ??
          DEFAULT_CONFIG.min_reviewers_per_proposal,
      ),
    title: translate('Edit minimum reviewers per proposal'),
    description: translate(
      'Minimum number of reviewers that must be assigned to each proposal',
    ),
  },
  {
    label: translate('Max reviewers per proposal'),
    key: 'max_reviewers_per_proposal',
    getValue: (config: MatchingConfig) =>
      String(
        config?.max_reviewers_per_proposal ??
          DEFAULT_CONFIG.max_reviewers_per_proposal,
      ),
    title: translate('Edit maximum reviewers per proposal'),
    description: translate(
      'Maximum number of reviewers that can be assigned to each proposal',
    ),
  },
  {
    label: translate('Max proposals per reviewer'),
    key: 'max_proposals_per_reviewer',
    getValue: (config: MatchingConfig) =>
      String(
        config?.max_proposals_per_reviewer ??
          DEFAULT_CONFIG.max_proposals_per_reviewer,
      ),
    title: translate('Edit maximum proposals per reviewer'),
    description: translate(
      'Maximum number of proposals a single reviewer can be assigned',
    ),
  },
  {
    label: translate('Minimum affinity'),
    key: 'min_affinity_threshold',
    getValue: (config: MatchingConfig) =>
      `${Math.round(
        (config?.min_affinity_threshold ??
          DEFAULT_CONFIG.min_affinity_threshold) * 100,
      )}%`,
    title: translate('Edit minimum affinity'),
    description: translate(
      'Reviewers who score below this for a proposal (0-1; 0.1 is 10%) are neither suggested nor assigned to it',
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
      'Not applied yet: generating assignments always picks reviewers by affinity, best first, whatever is chosen here.',
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
  { key: 'response', title: translate('Response window'), rows: [] },
];

export const MatchingSection: FC<MatchingSectionProps> = ({
  call,
  refetch,
  isReadOnly,
}) => {
  const { activeKey: activeTab, handleSelect: handleTabSelect } = useUrlTab(
    tabs,
    'matching_tab',
    { history: 'push' },
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
    <Card bordered>
      <CardHeader>
        <CardTitle as="div">
          <h3>
            {translate('Matching settings')}{' '}
            <Tooltip
              label={translate('Reviewer-Proposal Matching')}
              body={translate(
                'Configure how reviewers are matched to proposals based on expertise. Includes affinity calculation weights and assignment constraints.',
              )}
              autoWidth
            >
              <InfoIcon weight="bold" className="text-quaternary" />
            </Tooltip>
          </h3>
        </CardTitle>
        <CardToolbar>
          <MatchingSummaryButton config={config || DEFAULT_CONFIG} />
        </CardToolbar>
      </CardHeader>
      <CardContent>
        <Tabs mount="active" value={activeTab} onValueChange={handleTabSelect}>
          <TabsList className="mb-4">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.key} value={tab.key}>
                {tab.title}
              </TabsTrigger>
            ))}
          </TabsList>
          <>
            {/* Affinity calculation tab */}
            <TabsContent value="affinity">
              <PropertyList>
                {affinityRows.map((row) => (
                  <PropertyItem
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
                        disabled={isReadOnly}
                      />
                    }
                  />
                ))}
              </PropertyList>
              <AlertItem
                type="floating"
                variant="info"
                className="mt-3"
                title={translate(
                  'Weights should sum to 1.0 for optimal results. Current sum: {sum}',
                  {
                    sum: (
                      (config?.keyword_weight ?? 0.4) +
                      (config?.text_weight ?? 0.6)
                    ).toFixed(2),
                  },
                )}
              />
            </TabsContent>

            {/* Constraints tab */}
            <TabsContent value="constraints">
              <PropertyList>
                {constraintRows.map((row) => (
                  <PropertyItem
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
                        disabled={isReadOnly}
                      />
                    }
                  />
                ))}
              </PropertyList>
            </TabsContent>

            {/* How long reviewers have to answer: the call's assignment
                configuration, not its matching configuration. */}
            <TabsContent value="response">
              <ResponseWindowSettings call={call} isReadOnly={isReadOnly} />
            </TabsContent>
          </>
        </Tabs>
      </CardContent>
    </Card>
  );
};
