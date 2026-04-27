// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field, getFormValues, reduxForm } from 'redux-form';
import { createSelector } from 'reselect';
import {
  CoiSeverityLevel,
  CoiTypeEnum,
  ConflictOfInterestStatusEnum,
  ConflictsOfInterestListData,
  DetectionMethodEnum,
  ProtectedRound,
  proposalProtectedCallsRoundsList,
} from 'waldur-js-client';

import {
  Select,
  AsyncPaginate,
  REACT_SELECT_TABLE_FILTER,
} from '@/form/themed-select';
import { translate } from '@/i18n';
import { RootState } from '@/store/reducers';
import { createSelectFetcher } from '@/table/api';
import { TableFilterItem } from '@/table/TableFilterItem';

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

const PureConflictsOfInterestFilter: FunctionComponent<
  ConflictsOfInterestFilterProps
> = (props) => (
  <>
    <TableFilterItem
      title={translate('Round')}
      name="round"
      getValueLabel={(value: ProtectedRound) => value?.name}
    >
      <Field
        name="round"
        component={(fieldProps) => (
          <AsyncPaginate
            placeholder={translate('Round')}
            loadOptions={createSelectFetcher(
              proposalProtectedCallsRoundsList,
              null as any,
              {},
              { uuid: props.call.uuid },
            )}
            defaultOptions
            getOptionValue={(option: ProtectedRound) =>
              String(option.uuid || '')
            }
            getOptionLabel={(option: ProtectedRound) =>
              String(option.name || '')
            }
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            isClearable={true}
            {...REACT_SELECT_TABLE_FILTER}
            className="metronic-select-container"
          />
        )}
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Status')}
      name="status"
      getValueLabel={(value: ConflictOfInterestStatusOption) => value?.label}
    >
      <Field
        name="status"
        component={(fieldProps) => (
          <Select
            placeholder={translate('Status')}
            options={ConflictOfInterestStatusOptions}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            getOptionValue={(option: ConflictOfInterestStatusOption) =>
              String(option.value)
            }
            getOptionLabel={(option: ConflictOfInterestStatusOption) =>
              option.label
            }
            isClearable={true}
            isMulti={true}
            {...REACT_SELECT_TABLE_FILTER}
          />
        )}
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Severity')}
      name="severity"
      getValueLabel={(value: CoiSeverityLevelOption) => value?.label}
    >
      <Field
        name="severity"
        component={(fieldProps) => (
          <Select
            placeholder={translate('Severity')}
            options={CoiSeverityLevelOptions}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            getOptionValue={(option: CoiSeverityLevelOption) =>
              String(option.value)
            }
            getOptionLabel={(option: CoiSeverityLevelOption) => option.label}
            isClearable={true}
            {...REACT_SELECT_TABLE_FILTER}
          />
        )}
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Type')}
      name="coi_type"
      getValueLabel={(value: CoiTypeOption) => value?.label}
    >
      <Field
        name="coi_type"
        component={(fieldProps) => (
          <Select
            placeholder={translate('Type')}
            options={CoiTypeOptions}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            getOptionValue={(option: CoiTypeOption) => String(option.value)}
            getOptionLabel={(option: CoiTypeOption) => option.label}
            isClearable={true}
            isMulti={true}
            {...REACT_SELECT_TABLE_FILTER}
          />
        )}
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Detection')}
      name="detection_method"
      getValueLabel={(value: DetectionMethodOption) => value?.label}
    >
      <Field
        name="detection_method"
        component={(fieldProps) => (
          <Select
            placeholder={translate('Detection')}
            options={DetectionMethodOptions}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            getOptionValue={(option: DetectionMethodOption) =>
              String(option.value)
            }
            getOptionLabel={(option: DetectionMethodOption) => option.label}
            isClearable={true}
            isMulti={true}
            {...REACT_SELECT_TABLE_FILTER}
          />
        )}
      />
    </TableFilterItem>
  </>
);

export const ConflictsOfInterestFilterFormId = 'ConflictsOfInterestFilter';

interface ConflictsOfInterestFilterProps {
  call?: any;
}

interface ConflictsOfInterestFilterFormData {
  round: ProtectedRound;
  status: ConflictOfInterestStatusOption[];
  severity: CoiSeverityLevelOption;
  coi_type: CoiTypeOption[];
  detection_method: DetectionMethodOption[];
}

export const ConflictsOfInterestFilter = reduxForm<
  ConflictsOfInterestFilterFormData,
  ConflictsOfInterestFilterProps
>({
  form: ConflictsOfInterestFilterFormId,
  destroyOnUnmount: false,
})(PureConflictsOfInterestFilter);

type ConflictsOfInterestFilterQuery = ConflictsOfInterestListData['query'];

export const selectConflictsOfInterestFilter = createSelector<
  RootState,
  Partial<ConflictsOfInterestFilterFormData>,
  ConflictsOfInterestFilterQuery
>(getFormValues(ConflictsOfInterestFilterFormId), (values) => {
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
});
