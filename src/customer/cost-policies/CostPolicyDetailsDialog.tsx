import { FC, ReactNode } from 'react';

import { Badge, BaseButton } from 'waldur-ui';

import { formatDateTime } from '@/core/dateUtils';
import { defaultCurrency } from '@/core/formatCurrency';
import { lazyComponent } from '@/core/lazyComponent';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { EarlierInvoices } from '@/project/manage/EarlierInvoices';

import { CostPolicyAffectedResources } from './CostPolicyAffectedResources';
import { CostPolicyCost } from './CostPolicyCost';
import {
  getPolicyPeriodText,
  getPolicySubtitle,
  getResetScenarios,
} from './costPolicyDetails';
import { CostPolicyResetTable } from './CostPolicyResetTable';
import { getTriggerStatusView } from './triggerStatus';
import { CostPolicyType } from './types';
import { useCostPolicyDetails } from './useCostPolicyDetails';

const CostPolicyFixDialog = lazyComponent(() =>
  import('./CostPolicyFixDialog').then((module) => ({
    default: module.CostPolicyFixDialog,
  })),
);

const Section: FC<{ title: ReactNode; children: ReactNode }> = ({
  title,
  children,
}) => (
  <section className="mb-6">
    <h3 className="text-base font-semibold mb-2">{title}</h3>
    {children}
  </section>
);

interface CostPolicyDetailsDialogProps {
  resolve: {
    row;
    type: CostPolicyType;
    refetch?(): void;
    /** The policy's organization, when the opener knows it. */
    customerUuid?: string;
  };
}

/** What happened: why the policy fires or not, what it counts, what it
 * changed, and what would reset its actions. Read-only, for everyone who may
 * see the policy; those who may change it go on to the fix dialog. */
export const CostPolicyDetailsDialog: FC<CostPolicyDetailsDialogProps> = ({
  resolve,
}) => {
  const { type } = resolve;
  const { openDialog } = useModal();
  const { policy, credit, earlierInvoices, figures, canFix } =
    useCostPolicyDetails(resolve.row, type, resolve.customerUuid);
  const status = getTriggerStatusView(policy);
  const triggered = Boolean(policy.trigger_status?.triggered);
  const scenarios = getResetScenarios(policy);
  const firstMonth = earlierInvoices?.months?.[0]?.period;

  return (
    <ModalDialog
      title={translate('Cost policy details')}
      subtitle={getPolicySubtitle(policy)}
      footer={
        <>
          <CloseDialogButton label={translate('Close')} />
          {triggered && canFix ? (
            <BaseButton
              variant="primary"
              label={translate('Fix…')}
              onClick={() =>
                openDialog(CostPolicyFixDialog, {
                  size: 'lg',
                  resolve,
                })
              }
            />
          ) : null}
        </>
      }
    >
      <Section title={translate('What happened')}>
        <div className="flex flex-wrap items-center gap-3 mb-2">
          {status ? (
            <Badge variant={status.variant} shape="pill" tone="outline">
              {status.label}
            </Badge>
          ) : null}
          {policy.has_fired && policy.fired_datetime ? (
            <span className="text-quaternary text-sm">
              {translate('Fired on {date}', {
                date: formatDateTime(policy.fired_datetime),
              })}
            </span>
          ) : null}
        </div>
        {status ? <p className="mb-1">{status.explanation}</p> : null}
        <p className="mb-0 text-secondary">
          <span className="font-medium text-primary">
            {translate('Counted period:')}
          </span>{' '}
          {getPolicyPeriodText(policy, firstMonth)}
        </p>
      </Section>

      <Section title={translate('Cost against the limit')}>
        <CostPolicyCost
          policy={policy}
          figures={figures}
          months={earlierInvoices?.months}
        />
        <FormTable className="mt-4">
          <FormTable.Item
            label={translate('Cost in the period, before credit')}
            value={defaultCurrency(figures.beforeCredit)}
          />
          <FormTable.Item
            label={translate('Credit already used')}
            value={defaultCurrency(-figures.drawn)}
          />
          <FormTable.Item
            label={translate('Credit still to be used this month')}
            value={defaultCurrency(-figures.pending)}
          />
          <FormTable.Item
            label={translate('Cost after credit')}
            value={
              <span className="font-semibold">
                {defaultCurrency(figures.current)}
              </span>
            }
          />
          <FormTable.Item
            label={translate('Limit')}
            value={defaultCurrency(figures.limit)}
          />
        </FormTable>
      </Section>

      {policy.has_fired ? (
        <Section
          title={translate('Affected resources ({count})', {
            count: policy.affected_resources_count ?? 0,
          })}
        >
          <CostPolicyAffectedResources policy={policy} type={type} />
        </Section>
      ) : null}

      <Section title={translate('When the actions are reset')}>
        {triggered ? (
          <>
            <p className="mb-3">
              {translate(
                'Automatically, at the next evaluation of the policy, once the cost after credit is at or below the limit. Now it is {over} over it. Each change below lowers the cost; the last column says whether that is enough.',
                { over: defaultCurrency(figures.overBy) },
              )}
            </p>
            <CostPolicyResetTable
              policyUuid={policy.uuid}
              scenarios={scenarios}
            />
          </>
        ) : (
          <p className="mb-0">
            {policy.has_fired
              ? translate(
                  'The cost after credit is at or below the limit, so the actions it ran are reset at the next evaluation of the policy.',
                )
              : translate(
                  'The cost after credit is at or below the limit, so its actions do not run.',
                )}
          </p>
        )}
      </Section>

      {credit && figures.earlier > 0 ? (
        <EarlierInvoices credit={credit} hideAdvice />
      ) : null}

      {triggered && !canFix ? (
        <p className="mb-0 text-quaternary">
          {type === 'project'
            ? translate(
                'Organization owners and support can change this policy or the project credit.',
              )
            : translate('Support can change an organization policy.')}
        </p>
      ) : null}
    </ModalDialog>
  );
};
