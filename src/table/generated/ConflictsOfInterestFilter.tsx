// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import {
  CoiSeverityLevel,
  CoiTypeEnum,
  ConflictOfInterestStatusEnum,
  ConflictsOfInterestListData,
  DetectionMethodEnum,
  ProtectedRound,
  proposalProtectedCallsRoundsList,
} from 'waldur-js-client';

import { createLoadOptions } from '@/form/select/createLoadOptions';
import { translate } from '@/i18n';
import { AsyncSelectFilter, SelectFilter } from '@/table';

export const CoiSeverityLevelOptions: CoiSeverityLevelOption[] = [
  {
    label: translate('Apparent'),
    value: 'apparent',
  },
  {
    label: translate('Potential'),
    value: 'potential',
  },
  {
    label: translate('Real'),
    value: 'real',
  },
];
export interface CoiSeverityLevelOption {
  label: string;
  value: CoiSeverityLevel;
}

export const CoiTypeOptions: CoiTypeOption[] = [
  {
    label: translate('Co-authorship (Old)'),
    value: 'COAUTH_OLD',
  },
  {
    label: translate('Co-authorship (Recent)'),
    value: 'COAUTH_RECENT',
  },
  {
    label: translate('Collaborative (Active)'),
    value: 'COLLAB_ACTIVE',
  },
  {
    label: translate('Collaborative (Grant)'),
    value: 'COLLAB_GRANT',
  },
  {
    label: translate('Competition'),
    value: 'COMPET',
  },
  {
    label: translate('Conference Attendance'),
    value: 'CONF_ATTEND',
  },
  {
    label: translate('Financial (Direct)'),
    value: 'FIN_DIRECT',
  },
  {
    label: translate('Institutional (Consortium)'),
    value: 'INST_CONSORT',
  },
  {
    label: translate('Institutional (Department)'),
    value: 'INST_DEPT',
  },
  {
    label: translate('Institutional (Former)'),
    value: 'INST_FORMER',
  },
  {
    label: translate('Institutional (Same)'),
    value: 'INST_SAME',
  },
  {
    label: translate('Relationship (Editorial)'),
    value: 'REL_EDITORIAL',
  },
  {
    label: translate('Relative (Family)'),
    value: 'REL_FAMILY',
  },
  {
    label: translate('Relationship (Mentor)'),
    value: 'REL_MENTOR',
  },
  {
    label: translate('Relationship (Supervisor)'),
    value: 'REL_SUPERVISOR',
  },
  {
    label: translate('Role (Confidential)'),
    value: 'ROLE_CONF',
  },
  {
    label: translate('Role (Named)'),
    value: 'ROLE_NAMED',
  },
  {
    label: translate('Society Member'),
    value: 'SOC_MEMBER',
  },
];
export interface CoiTypeOption {
  label: string;
  value: CoiTypeEnum;
}

export const ConflictOfInterestStatusOptions: ConflictOfInterestStatusOption[] =
  [
    {
      label: translate('Dismissed'),
      value: 'dismissed',
    },
    {
      label: translate('Pending'),
      value: 'pending',
    },
    {
      label: translate('Recused'),
      value: 'recused',
    },
    {
      label: translate('Waived'),
      value: 'waived',
    },
  ];
export interface ConflictOfInterestStatusOption {
  label: string;
  value: ConflictOfInterestStatusEnum;
}

export const DetectionMethodOptions: DetectionMethodOption[] = [
  {
    label: translate('Automated'),
    value: 'automated',
  },
  {
    label: translate('Manager identified'),
    value: 'manager_identified',
  },
  {
    label: translate('Reported'),
    value: 'reported',
  },
  {
    label: translate('Self disclosed'),
    value: 'self_disclosed',
  },
];
export interface DetectionMethodOption {
  label: string;
  value: DetectionMethodEnum;
}

export const ConflictsOfInterestFilter: FunctionComponent<
  ConflictsOfInterestFilterProps
> = (props) => (
  <>
    <AsyncSelectFilter
      title={translate('Round')}
      name="round"
      getValueLabel={(value: ProtectedRound) => value?.name}
      placeholder={translate('Round')}
      loadOptions={createLoadOptions(
        proposalProtectedCallsRoundsList,
        null as any,
        {},
        { uuid: props.call.uuid },
      )}
      defaultOptions
      getOptionValue={(option: ProtectedRound) => String(option.uuid || '')}
      getOptionLabel={(option: ProtectedRound) => String(option.name || '')}
      isClearable={true}
    />
    <SelectFilter
      title={translate('Status')}
      name="status"
      getValueLabel={(value: ConflictOfInterestStatusOption) => value?.label}
      placeholder={translate('Status')}
      options={ConflictOfInterestStatusOptions}
      getOptionValue={(option: ConflictOfInterestStatusOption) =>
        String(option.value)
      }
      getOptionLabel={(option: ConflictOfInterestStatusOption) => option.label}
      isClearable={true}
      isMulti={true}
    />
    <SelectFilter
      title={translate('Severity')}
      name="severity"
      getValueLabel={(value: CoiSeverityLevelOption) => value?.label}
      placeholder={translate('Severity')}
      options={CoiSeverityLevelOptions}
      getOptionValue={(option: CoiSeverityLevelOption) => String(option.value)}
      getOptionLabel={(option: CoiSeverityLevelOption) => option.label}
      isClearable={true}
    />
    <SelectFilter
      title={translate('Type')}
      name="coi_type"
      getValueLabel={(value: CoiTypeOption) => value?.label}
      placeholder={translate('Type')}
      options={CoiTypeOptions}
      getOptionValue={(option: CoiTypeOption) => String(option.value)}
      getOptionLabel={(option: CoiTypeOption) => option.label}
      isClearable={true}
      isMulti={true}
    />
    <SelectFilter
      title={translate('Detection')}
      name="detection_method"
      getValueLabel={(value: DetectionMethodOption) => value?.label}
      placeholder={translate('Detection')}
      options={DetectionMethodOptions}
      getOptionValue={(option: DetectionMethodOption) => String(option.value)}
      getOptionLabel={(option: DetectionMethodOption) => option.label}
      isClearable={true}
      isMulti={true}
    />
  </>
);

export const ConflictsOfInterestFilterFormId = 'ConflictsOfInterestFilter';

interface ConflictsOfInterestFilterProps {
  call?: any;
}

export interface ConflictsOfInterestFilterFormData {
  round: ProtectedRound;
  status: ConflictOfInterestStatusOption[];
  severity: CoiSeverityLevelOption;
  coi_type: CoiTypeOption[];
  detection_method: DetectionMethodOption[];
}

type ConflictsOfInterestFilterQuery = ConflictsOfInterestListData['query'];

export const selectConflictsOfInterestFilter = (
  values?: Partial<ConflictsOfInterestFilterFormData>,
): ConflictsOfInterestFilterQuery => {
  const filter: ConflictsOfInterestFilterQuery = {} as any;
  if (values) {
    if (values.round) {
      filter.round_uuid = values.round.uuid;
    }
    if (values.status) {
      filter.status = values.status.map((v: any) => v.value);
    }
    if (values.severity) {
      filter.severity = values.severity.value;
    }
    if (values.coi_type) {
      filter.coi_type = values.coi_type.map((v: any) => v.value);
    }
    if (values.detection_method) {
      filter.detection_method = values.detection_method.map(
        (v: any) => v.value,
      );
    }
  }
  return filter;
};
