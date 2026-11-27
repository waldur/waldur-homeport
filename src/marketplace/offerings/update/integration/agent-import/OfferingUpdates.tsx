import { createContext, FC, ReactNode, useContext, useMemo } from 'react';

import {
  AlertItem,
  Checkbox,
  Code,
  FormField,
  FormLabel,
  FormText,
  Select,
  Tooltip,
} from 'waldur-ui';

import { translate } from '@/i18n';
import { SimpleTable } from '@/table/SimpleTable';
import { Column } from '@/table/types';

import {
  AgentComponentDifference,
  AgentComponentField,
  AgentPolicyActionChoice,
  AgentPolicyChange,
  AgentPolicyPreview,
} from './api';
import { isSameComponentField } from './importModel';
import { renderImportValue } from './renderImportValue';

const Heading: FC<{ children: ReactNode }> = ({ children }) => (
  <h3 className="text-base font-semibold mt-5 mb-2">{children}</h3>
);

// A choice the import may not make is shown disabled, with the reason it
// may not as its tooltip.
const withReason = (reason: string | null, control: ReactNode) =>
  reason ? (
    <Tooltip label={reason}>
      <span className="inline-flex" data-testid="choice-disabled-reason">
        {control}
      </span>
    </Tooltip>
  ) : (
    control
  );

/**
 * A row of the component differences: a field, or a component the offering
 * lacks, which has no field of its own.
 */
type ComponentRow = AgentComponentDifference & { missing: boolean };

// What the choice cells read. Through a context, so the columns, and with
// them the cells, stay the same components from one render to the next.
const ComponentChoiceContext = createContext<{
  selected: AgentComponentField[];
  disabled: boolean;
  onToggle(item: AgentComponentField, checked: boolean): void;
}>({ selected: [], disabled: true, onToggle: () => undefined });

const ComponentChoiceCell: FC<{ row: ComponentRow }> = ({ row }) => {
  const { selected, disabled, onToggle } = useContext(ComponentChoiceContext);
  if (row.missing) {
    return null;
  }
  const reason = row.applicable ? null : row.reason;
  return (
    <div className="flex flex-col gap-1">
      {withReason(
        reason,
        <Checkbox
          aria-label={translate('Update {field} of {component}', {
            field: row.field,
            component: row.component,
          })}
          checked={selected.some((item) => isSameComponentField(item, row))}
          disabled={disabled || !row.applicable}
          onCheckedChange={(checked) => onToggle(row, checked)}
        />,
      )}
      {reason ? (
        <span
          className="text-xs text-tertiary whitespace-normal"
          data-testid="choice-reason"
        >
          {reason}
        </span>
      ) : null}
    </div>
  );
};

const getComponentColumns = (): Column<ComponentRow>[] => [
  {
    title: translate('Update the offering'),
    className: 'max-w-60',
    render: ComponentChoiceCell,
  },
  {
    title: translate('Component'),
    render: ({ row }) => <Code>{row.component}</Code>,
  },
  {
    title: translate('Field'),
    className: 'whitespace-normal',
    render: ({ row }) =>
      row.missing ? (
        <span className="text-tertiary" data-testid="missing-component">
          {translate(
            'The offering has no such component: add it with its price first.',
          )}
        </span>
      ) : (
        <Code>{row.field}</Code>
      ),
  },
  {
    title: translate('Offering'),
    render: ({ row }) => (row.missing ? null : renderImportValue(row.offering)),
  },
  {
    title: translate('File'),
    render: ({ row }) => (row.missing ? null : renderImportValue(row.imported)),
  },
];

interface ComponentDifferencesProps {
  differences: AgentComponentDifference[];
  /** The components the offering lacks, each one row. */
  missing: string[];
  selected: AgentComponentField[];
  disabled: boolean;
  onToggle(item: AgentComponentField, checked: boolean): void;
}

export const ComponentDifferences: FC<ComponentDifferencesProps> = ({
  differences,
  missing,
  selected,
  disabled,
  onToggle,
}) => {
  const columns = useMemo(getComponentColumns, []);
  const rows = useMemo<ComponentRow[]>(
    () => [
      ...missing.map((component) => ({
        component,
        field: '',
        offering: null,
        imported: null,
        applicable: false,
        reason: null,
        missing: true,
      })),
      ...differences.map((row) => ({ ...row, missing: false })),
    ],
    [missing, differences],
  );
  const choice = useMemo(
    () => ({ selected, disabled, onToggle }),
    [selected, disabled, onToggle],
  );
  return (
    <div data-testid="import-component-differences">
      <Heading>{translate('Component differences')}</Heading>
      <p className="text-secondary mb-2">
        {translate(
          "The file differs from the offering's components. They stay as they are unless you choose to update them from the file.",
        )}
      </p>
      {differences.length ? (
        <AlertItem
          type="floating"
          variant="warning"
          className="mb-3"
          title={translate('Updating components affects existing resources')}
          body={translate(
            'The unit and unit factor change how the limits and usage of existing resources are converted and billed. The label renames the component customers see.',
          )}
        />
      ) : null}
      <ComponentChoiceContext.Provider value={choice}>
        <SimpleTable columns={columns} rows={rows} />
      </ComponentChoiceContext.Provider>
    </div>
  );
};

const getPolicyColumns = (): Column<AgentPolicyChange>[] => [
  {
    title: translate('Field'),
    render: ({ row }) => <Code>{row.field}</Code>,
  },
  {
    title: translate('Current'),
    render: ({ row }) => renderImportValue(row.current),
  },
  {
    title: translate('File'),
    render: ({ row }) => renderImportValue(row.imported),
  },
];

interface PolicyActionsFieldProps {
  policy: AgentPolicyPreview;
  actions: string[];
  errors: string[];
  disabled: boolean;
  onChange(actions: string[]): void;
}

// What the policy does when it fires: required for a policy the import
// creates, and for an existing one a change of its actions, kept when left
// empty.
const PolicyActionsField: FC<PolicyActionsFieldProps> = ({
  policy,
  actions,
  errors,
  disabled,
  onChange,
}) => {
  const label = policy.needs_actions
    ? translate('When the policy fires')
    : translate('Change its actions');
  return (
    <FormField className="mt-3" data-testid="import-policy-actions">
      <FormLabel required={policy.needs_actions}>{label}</FormLabel>
      <Select
        isMulti
        aria-label={label}
        options={policy.action_choices}
        value={policy.action_choices.filter((choice) =>
          actions.includes(choice.value),
        )}
        onChange={(selected: AgentPolicyActionChoice[] | null) =>
          onChange((selected ?? []).map((choice) => choice.value))
        }
        isDisabled={disabled}
        isClearable
      />
      {errors.map((error) => (
        <FormText key={error} variant="danger">
          {error}
        </FormText>
      ))}
      <FormText variant="muted">
        {policy.needs_actions
          ? translate(
              'This decides what happens when a project exceeds its periodic allocation.',
            )
          : translate(
              'Leave it empty to keep the actions the policy has. They decide what happens when a project exceeds its periodic allocation.',
            )}
      </FormText>
    </FormField>
  );
};

interface PolicyChangesProps {
  policy: AgentPolicyPreview;
  checked: boolean;
  disabled: boolean;
  onChange(checked: boolean): void;
  actions: string[];
  actionErrors: string[];
  onActionsChange(actions: string[]): void;
}

export const PolicyChanges: FC<PolicyChangesProps> = ({
  policy,
  checked,
  disabled,
  onChange,
  actions,
  actionErrors,
  onActionsChange,
}) => {
  const columns = useMemo(getPolicyColumns, []);
  return (
    <div data-testid="import-policy">
      <Heading>{translate('Periodic usage policy')}</Heading>
      <p className="text-secondary mb-2">
        {policy.exists
          ? translate(
              "The file's policy settings, against the offering's periodic usage policy.",
            )
          : translate(
              'The file has policy settings, and the offering has no periodic usage policy yet.',
            )}
      </p>
      {policy.changes.length ? (
        <SimpleTable columns={columns} rows={policy.changes} rowKey="field" />
      ) : (
        <p className="text-tertiary">
          {translate('The policy already has these settings.')}
        </p>
      )}
      <div className="mt-3">
        {withReason(
          policy.applicable ? null : policy.reason,
          <Checkbox
            label={
              policy.exists
                ? translate('Also update the periodic usage policy')
                : translate('Also create the periodic usage policy')
            }
            description={policy.applicable ? undefined : policy.reason}
            checked={checked}
            disabled={disabled || !policy.applicable}
            onCheckedChange={onChange}
          />,
        )}
      </div>
      {checked ? (
        <PolicyActionsField
          policy={policy}
          actions={actions}
          errors={actionErrors}
          disabled={disabled}
          onChange={onActionsChange}
        />
      ) : null}
    </div>
  );
};
