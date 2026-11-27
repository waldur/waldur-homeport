import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { FC, memo, ReactNode, useMemo } from 'react';

import { AlertItem, BaseButton, Code } from 'waldur-ui';

import { translate } from '@/i18n';
import { SimpleTable } from '@/table/SimpleTable';
import { Column } from '@/table/types';

import {
  AgentComponentField,
  AgentConfigurationChange,
  AgentConfigurationIgnoredKey,
  AgentConfigurationImport,
  AgentConfigurationUnresolved,
} from './api';
import { PlaceholderType, splitMissingComponents } from './importModel';
import { ComponentDifferences, PolicyChanges } from './OfferingUpdates';
import { renderImportValue } from './renderImportValue';
import { UnresolvedSettings } from './UnresolvedSettings';

const getChangeColumns = (): Column<AgentConfigurationChange>[] => [
  {
    title: translate('Setting'),
    render: ({ row }) => <Code>{row.path}</Code>,
  },
  {
    title: translate('Current'),
    render: ({ row }) => renderImportValue(row.current),
  },
  {
    title: translate('Imported'),
    render: ({ row }) => renderImportValue(row.imported),
  },
];

const getIgnoredColumns = (): Column<AgentConfigurationIgnoredKey>[] => [
  { title: translate('Key'), render: ({ row }) => <Code>{row.path}</Code> },
  { title: translate('Reason'), render: ({ row }) => row.reason },
];

const Heading: FC<{ children: ReactNode }> = ({ children }) => (
  <h3 className="text-base font-semibold mt-5 mb-2">{children}</h3>
);

interface PreviewDetailsProps {
  preview: AgentConfigurationImport;
  applyComponents: AgentComponentField[];
  applyPolicy: boolean;
  checking: boolean;
  onToggleComponent(item: AgentComponentField, checked: boolean): void;
  onApplyPolicyChange(checked: boolean): void;
  policyActions: string[];
  policyActionErrors: string[];
  onPolicyActionsChange(actions: string[]): void;
}

/**
 * What the preview says. Memoized, with columns that keep their identity:
 * typing a placeholder value re-renders the review, and must not redraw
 * (and remount) these tables under the user.
 */
const PreviewDetails: FC<PreviewDetailsProps> = memo(
  ({
    preview,
    applyComponents,
    applyPolicy,
    checking,
    onToggleComponent,
    onApplyPolicyChange,
    policyActions,
    policyActionErrors,
    onPolicyActionsChange,
  }) => {
    const changeColumns = useMemo(getChangeColumns, []);
    const ignoredColumns = useMemo(getIgnoredColumns, []);
    const components = useMemo(
      () =>
        splitMissingComponents(preview.component_differences, preview.ignored),
      [preview.component_differences, preview.ignored],
    );
    return (
      <>
        <h3 className="text-base font-semibold mb-2">{translate('Changes')}</h3>
        {preview.changes.length ? (
          <div className="max-h-80 overflow-auto" data-testid="import-changes">
            <SimpleTable
              columns={changeColumns}
              rows={preview.changes}
              rowKey="path"
            />
          </div>
        ) : (
          <p className="text-tertiary">
            {translate(
              'The offering already has this configuration: there is nothing to import.',
            )}
          </p>
        )}

        {preview.dropped_secrets.length ? (
          <div data-testid="import-dropped-secrets">
            <Heading>{translate('Secrets left out')}</Heading>
            <p className="text-secondary mb-2">
              {translate(
                "Waldur does not store secrets. They stay in the agent's configuration file on the agent host.",
              )}
            </p>
            <ul className="ps-4 list-disc">
              {preview.dropped_secrets.map((path) => (
                <li key={path}>
                  <Code>{path}</Code>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {components.ignored.length ? (
          <div data-testid="import-ignored">
            <Heading>{translate('Ignored')}</Heading>
            <SimpleTable
              columns={ignoredColumns}
              rows={components.ignored}
              rowKey="path"
            />
          </div>
        ) : null}

        {preview.component_differences.length ? (
          <ComponentDifferences
            differences={components.differences}
            missing={components.missing}
            selected={applyComponents}
            disabled={checking}
            onToggle={onToggleComponent}
          />
        ) : null}

        {preview.policy ? (
          <PolicyChanges
            policy={preview.policy}
            checked={applyPolicy}
            disabled={checking}
            onChange={onApplyPolicyChange}
            actions={policyActions}
            actionErrors={policyActionErrors}
            onActionsChange={onPolicyActionsChange}
          />
        ) : null}
      </>
    );
  },
);
PreviewDetails.displayName = 'PreviewDetails';

interface ReviewStepProps {
  preview: AgentConfigurationImport | null;
  errors: string[];
  unresolved: AgentConfigurationUnresolved[];
  types: Record<string, PlaceholderType | undefined>;
  values: Record<string, string>;
  applyComponents: AgentComponentField[];
  applyPolicy: boolean;
  /** Values or choices changed since the preview was made. */
  stale: boolean;
  checking: boolean;
  onValueChange(path: string, value: string): void;
  onToggleComponent(item: AgentComponentField, checked: boolean): void;
  onApplyPolicyChange(checked: boolean): void;
  policyActions: string[];
  policyActionErrors: string[];
  onPolicyActionsChange(actions: string[]): void;
  onCheckAgain(): void;
}

export const ReviewStep: FC<ReviewStepProps> = ({
  preview,
  errors,
  unresolved,
  types,
  values,
  applyComponents,
  applyPolicy,
  stale,
  checking,
  onValueChange,
  onToggleComponent,
  onApplyPolicyChange,
  policyActions,
  policyActionErrors,
  onPolicyActionsChange,
  onCheckAgain,
}) => (
  <>
    {stale ? (
      <AlertItem
        type="floating"
        variant="info"
        className="mb-4"
        data-testid="import-stale"
        title={translate(
          'The preview does not reflect your values and choices yet.',
        )}
        actions={
          <BaseButton
            label={translate('Check again')}
            iconNode={<ArrowsClockwiseIcon weight="bold" />}
            variant="tertiary"
            onClick={onCheckAgain}
            pending={checking}
            disabled={checking}
            disabledReason={translate('Checking the configuration')}
            data-testid="import-check-again"
          />
        }
      />
    ) : null}
    {errors.length ? (
      <AlertItem
        type="floating"
        variant="error"
        className="mb-4"
        data-testid="import-errors"
        title={translate('The configuration cannot be imported')}
        body={
          <ul className="mb-0 ps-4 list-disc">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        }
      />
    ) : null}
    {unresolved.length ? (
      <UnresolvedSettings
        unresolved={unresolved}
        types={types}
        values={values}
        checking={checking}
        onValueChange={onValueChange}
      />
    ) : null}
    {preview ? (
      <PreviewDetails
        preview={preview}
        applyComponents={applyComponents}
        applyPolicy={applyPolicy}
        checking={checking}
        onToggleComponent={onToggleComponent}
        onApplyPolicyChange={onApplyPolicyChange}
        policyActions={policyActions}
        policyActionErrors={policyActionErrors}
        onPolicyActionsChange={onPolicyActionsChange}
      />
    ) : null}
  </>
);
