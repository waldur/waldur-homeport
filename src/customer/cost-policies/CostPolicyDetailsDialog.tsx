import { FC, ReactNode } from 'react';

import { Badge, BaseButton, PropertyList, PropertyItem } from 'waldur-ui';

import { formatDateTime } from '@/core/dateUtils';
import { defaultCurrency } from '@/core/formatCurrency';
import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { EarlierInvoices } from '@/project/manage/EarlierInvoices';
import { propVal } from '@/property/propertyFields';

import { CostPolicyAffectedResources } from './CostPolicyAffectedResources';
import { CostPolicyCost } from './CostPolicyCost';
import {
  CostPolicyFigures,
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

const getBelowLimitText = (figures: CostPolicyFigures, hasFired: boolean) => {
  if (figures.ignoresCredit) {
    return hasFired
      ? translate(
          'The cost is at or below the limit, so the actions it ran are reset at the next evaluation of the policy.',
        )
      : translate(
          'The cost is at or below the limit, so its actions do not run.',
        );
  }
  return hasFired
    ? translate(
        'The cost after credit is at or below the limit, so the actions it ran are reset at the next evaluation of the policy.',
      )
    : translate(
        'The cost after credit is at or below the limit, so its actions do not run.',
      );
};

const getWhoCanChangeText = (type: CostPolicyType, ignoresCredit: boolean) => {
  if (type !== 'project') {
    return translate('Support can change an organization policy.');
  }
  return ignoresCredit
    ? translate('Organization owners and support can change this policy.')
    : translate(
        'Organization owners and support can change this policy or the project credit.',
      );
};

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
        <PropertyList className="mt-4">
          {figures.ignoresCredit ? null : (
            <>
              <PropertyItem
                label={translate('Cost in the period, before credit')}
                value={propVal.currency(figures.beforeCredit)}
              />
              <PropertyItem
                label={translate('Credit already used')}
                value={propVal.currency(-figures.drawn)}
              />
              <PropertyItem
                label={translate('Credit still to be used this month')}
                value={propVal.currency(-figures.pending)}
              />
            </>
          )}
          <PropertyItem
            label={
              figures.ignoresCredit
                ? translate('Cost in the period')
                : translate('Cost after credit')
            }
            value={propVal.currency(figures.current)}
            valueClass="font-semibold"
          />
          <PropertyItem
            label={translate('Limit')}
            value={propVal.currency(figures.limit)}
          />
        </PropertyList>
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
              {figures.ignoresCredit
                ? translate(
                    'Automatically, at the next evaluation of the policy, once the cost is at or below the limit. Now it is {over} over it. This policy does not take credit into account, so credit does not lower the cost; the last column says which change is enough.',
                    { over: defaultCurrency(figures.overBy) },
                  )
                : translate(
                    'Automatically, at the next evaluation of the policy, once the cost after credit is at or below the limit. Now it is {over} over it. Each change below lowers the cost; the last column says whether that is enough.',
                    { over: defaultCurrency(figures.overBy) },
                  )}
            </p>
            <CostPolicyResetTable
              policyUuid={policy.uuid}
              scenarios={scenarios}
              ignoresCredit={figures.ignoresCredit}
            />
          </>
        ) : (
          <p className="mb-0">{getBelowLimitText(figures, policy.has_fired)}</p>
        )}
      </Section>

      {credit && figures.earlier > 0 && !figures.ignoresCredit ? (
        <EarlierInvoices credit={credit} hideAdvice />
      ) : null}

      {triggered && !canFix ? (
        <p className="mb-0 text-quaternary">
          {getWhoCanChangeText(type, figures.ignoresCredit)}
        </p>
      ) : null}
    </ModalDialog>
  );
};
