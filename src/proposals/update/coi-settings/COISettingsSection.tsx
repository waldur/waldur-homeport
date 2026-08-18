import { InfoIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import {
  type CallCoiConfiguration,
  proposalProtectedCallsCoiConfigurationPartialUpdate,
  proposalProtectedCallsCoiConfigurationRetrieve,
} from 'waldur-js-client';

import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { Tip } from '@/core/Tooltip';
import {
  BooleanEditField,
  EditFieldProvider,
  NumberEditField,
  SelectEditField,
} from '@/form/editFields';
import { TabbedSection } from '@/form/TabbedSection';
import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { Call } from '@/proposals/types';
import { getCallReadOnlyReason } from '@/proposals/utils';

import { COISummaryButton } from './COISummaryButton';

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

// Proposal disclosure level options for invitations
const DISCLOSURE_LEVEL_OPTIONS = [
  { value: 'titles_only', label: translate('Titles only') },
  { value: 'titles_and_summaries', label: translate('Titles and summaries') },
  { value: 'full_details', label: translate('Full proposal details') },
];

export const COI_TYPE_OPTIONS = [
  // Real conflicts (must recuse)
  { value: 'INST_SAME', label: translate('Same institution') },
  { value: 'FIN_DIRECT', label: translate('Direct financial interest') },
  { value: 'REL_FAMILY', label: translate('Family relationship') },
  { value: 'ROLE_NAMED', label: translate('Named on proposal') },
  { value: 'COLLAB_ACTIVE', label: translate('Active collaboration') },
  { value: 'REL_MENTOR', label: translate('Mentor/mentee relationship') },
  { value: 'REL_SUPERVISOR', label: translate('Supervisor relationship') },
  // Apparent conflicts (requires management)
  { value: 'COAUTH_RECENT', label: translate('Recent co-authorship') },
  { value: 'INST_DEPT', label: translate('Same department') },
  { value: 'INST_FORMER', label: translate('Former institution') },
  { value: 'ROLE_CONF', label: translate('Conference organizer') },
  { value: 'COLLAB_GRANT', label: translate('Grant collaboration') },
  { value: 'REL_EDITORIAL', label: translate('Editorial relationship') },
  { value: 'COMPET', label: translate('Competitor') },
  // Potential conflicts (disclosure only)
  { value: 'COAUTH_OLD', label: translate('Distant co-authorship') },
  { value: 'INST_CONSORT', label: translate('Consortium membership') },
  { value: 'CONF_ATTEND', label: translate('Conference participation') },
  { value: 'SOC_MEMBER', label: translate('Professional society') },
];

const COI_TYPE_LABELS = COI_TYPE_OPTIONS.reduce(
  (acc, opt) => {
    acc[opt.value] = opt.label;
    return acc;
  },
  {} as Record<string, string>,
);

const formatTypeList = (types: string[] | undefined) => {
  if (!types?.length) return translate('Not configured');
  return types.map((t) => COI_TYPE_LABELS[t] || t).join(', ');
};

// The three mutually-exclusive type-handling rule selectors. A conflict type
// may only be assigned to a single rule, so options already picked in the other
// rules are removed from a selector's list (WAL-9601).
const TYPE_HANDLING_FIELDS = [
  'recusal_required_types',
  'management_allowed_types',
  'disclosure_only_types',
] as const;

type TypeHandlingField = (typeof TYPE_HANDLING_FIELDS)[number];

export const getAvailableTypeOptions = (
  config: CallCoiConfiguration | undefined,
  currentField: TypeHandlingField,
) => {
  const currentValues = new Set<string>(config?.[currentField] ?? []);
  const usedInOtherFields = new Set<string>(
    TYPE_HANDLING_FIELDS.filter((field) => field !== currentField).flatMap(
      (field) => config?.[field] ?? [],
    ),
  );
  // Keep the current selection visible; drop only types owned by other rules.
  return COI_TYPE_OPTIONS.filter(
    (opt) => currentValues.has(opt.value) || !usedInOtherFields.has(opt.value),
  );
};

export const COISettingsSection: FC<COISettingsSectionProps> = ({
  call,
  isReadOnly,
}) => {
  const {
    data: config,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['coiConfiguration', call.uuid],
    queryFn: () => fetchCallCoiConfiguration(call.uuid),
  });

  const { mutateAsync: updateConfig } = useManagedMutation({
    mutationFn: (formData: Record<string, any>) =>
      proposalProtectedCallsCoiConfigurationPartialUpdate({
        path: { uuid: call.uuid },
        body: formData as any,
      }),
    successMessage: translate('COI setting has been updated.'),
    errorMessage: translate('Unable to update COI setting.'),
    onSuccess: () => {
      refetch();
    },
    closeModal: false,
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
    <TabbedSection
      title={
        <span className="d-flex align-items-center gap-2">
          {translate('COI configuration')}
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
        </span>
      }
      actions={<COISummaryButton config={config} />}
      enableSearch
      syncKey="coi_tab"
    >
      <TabbedSection.Tab id="detection" title={translate('Detection')}>
        <EditFieldProvider
          scope={config}
          callback={updateConfig}
          readOnlyReason={isReadOnly ? getCallReadOnlyReason(call) : undefined}
        >
          <NumberEditField
            name="coauthorship_lookback_years"
            label={translate('Co-authorship lookback')}
            description={translate(
              'Number of years to search for shared publications between reviewers and proposal team members',
            )}
            min={1}
            max={10}
            disabled={isReadOnly}
            renderValue={(value) => translate('{n} years', { n: value ?? 3 })}
          />
          <NumberEditField
            name="coauthorship_threshold_papers"
            label={translate('Co-authorship threshold')}
            description={translate(
              'Minimum number of shared publications required to trigger a co-authorship conflict',
            )}
            min={1}
            max={10}
            disabled={isReadOnly}
            renderValue={(value) =>
              translate('{n} shared papers', { n: value ?? 1 })
            }
          />
          <NumberEditField
            name="institutional_lookback_years"
            label={translate('Institutional lookback')}
            description={translate(
              'Number of years to consider past institutional affiliations when detecting conflicts',
            )}
            min={1}
            max={10}
            disabled={isReadOnly}
            renderValue={(value) => translate('{n} years', { n: value ?? 2 })}
          />
          <BooleanEditField
            name="include_same_department"
            label={translate('Detect same department')}
            description={translate(
              'Flag a conflict when reviewer and proposal team member are in the same department',
            )}
            disabled={isReadOnly}
            renderValue={(value) =>
              value ? translate('Yes') : translate('No')
            }
          />
          <BooleanEditField
            name="include_same_institution"
            label={translate('Detect same institution')}
            description={translate(
              'Flag a conflict when reviewer and proposal team member are at the same institution',
            )}
            disabled={isReadOnly}
            renderValue={(value) =>
              value ? translate('Yes') : translate('No')
            }
          />
        </EditFieldProvider>
      </TabbedSection.Tab>

      <TabbedSection.Tab id="automation" title={translate('Automation')}>
        <EditFieldProvider
          scope={config}
          callback={updateConfig}
          readOnlyReason={isReadOnly ? getCallReadOnlyReason(call) : undefined}
        >
          <BooleanEditField
            name="auto_detect_coauthorship"
            label={translate('Auto-detect co-authorship')}
            description={translate(
              'Automatically scan publication records to identify co-authorship relationships',
            )}
            disabled={isReadOnly}
            renderValue={(value) =>
              value ? translate('Enabled') : translate('Disabled')
            }
          />
          <BooleanEditField
            name="auto_detect_institutional"
            label={translate('Auto-detect institutional')}
            description={translate(
              'Automatically compare institutional affiliations between reviewers and proposal teams',
            )}
            disabled={isReadOnly}
            renderValue={(value) =>
              value ? translate('Enabled') : translate('Disabled')
            }
          />
          <BooleanEditField
            name="auto_detect_named_personnel"
            label={translate('Auto-detect named personnel')}
            description={translate(
              'Automatically check if a reviewer is named as personnel on any proposal',
            )}
            disabled={isReadOnly}
            renderValue={(value) =>
              value ? translate('Enabled') : translate('Disabled')
            }
          />
        </EditFieldProvider>
      </TabbedSection.Tab>

      <TabbedSection.Tab id="types" title={translate('Type handling')}>
        <EditFieldProvider
          scope={config}
          callback={updateConfig}
          readOnlyReason={isReadOnly ? getCallReadOnlyReason(call) : undefined}
        >
          <SelectEditField
            name="recusal_required_types"
            label={translate('Types requiring recusal')}
            description={translate(
              'Conflict types that require the reviewer to withdraw from reviewing the proposal entirely',
            )}
            options={getAvailableTypeOptions(config, 'recusal_required_types')}
            isMulti
            simpleValue
            placeholder={translate('Select COI types...')}
            disabled={isReadOnly}
            renderValue={(value) => formatTypeList(value)}
          />
          <SelectEditField
            name="management_allowed_types"
            label={translate('Types allowing management plan')}
            description={translate(
              'Conflict types where the reviewer may continue with an approved management plan',
            )}
            options={getAvailableTypeOptions(
              config,
              'management_allowed_types',
            )}
            isMulti
            simpleValue
            placeholder={translate('Select COI types...')}
            disabled={isReadOnly}
            renderValue={(value) => formatTypeList(value)}
          />
          <SelectEditField
            name="disclosure_only_types"
            label={translate('Types requiring disclosure only')}
            description={translate(
              'Conflict types that only need to be disclosed but do not require further action',
            )}
            options={getAvailableTypeOptions(config, 'disclosure_only_types')}
            isMulti
            simpleValue
            placeholder={translate('Select COI types...')}
            disabled={isReadOnly}
            renderValue={(value) => formatTypeList(value)}
          />
        </EditFieldProvider>
      </TabbedSection.Tab>

      <TabbedSection.Tab id="invitations" title={translate('Invitations')}>
        <EditFieldProvider
          scope={config}
          callback={updateConfig}
          readOnlyReason={isReadOnly ? getCallReadOnlyReason(call) : undefined}
        >
          <SelectEditField
            name="invitation_proposal_disclosure"
            label={translate('Proposal disclosure level')}
            description={translate(
              'Controls how much proposal information is disclosed to reviewers in invitations. This helps reviewers assess potential conflicts of interest before accepting.',
            )}
            options={DISCLOSURE_LEVEL_OPTIONS}
            simpleValue
            placeholder={translate('Select an option...')}
            disabled={isReadOnly}
            renderValue={(value) =>
              DISCLOSURE_LEVEL_LABELS[value] || translate('Titles only')
            }
          />
        </EditFieldProvider>
      </TabbedSection.Tab>
    </TabbedSection>
  );
};
