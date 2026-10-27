import { FC } from 'react';
import {
  CompensateInEnum,
  marketplaceCustomerEstimatedCostPoliciesPartialUpdate,
  marketplaceProjectEstimatedCostPoliciesPartialUpdate,
  projectCreditsPartialUpdate,
  projectCreditsPayEarlierInvoices,
} from 'waldur-js-client';

import {
  AlertItem,
  Badge,
  BaseButton,
  FormField,
  FormLabel,
  FormText,
  NumberInput,
} from 'waldur-ui';

import { defaultCurrency } from '@/core/formatCurrency';
import { lazyComponent } from '@/core/lazyComponent';
import { StaffOnlyIndicator } from '@/core/StaffOnlyIndicator';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

import {
  FixOption,
  getFixOptions,
  getPolicyPeriodText,
  getPolicySubtitle,
  getResetScenarios,
} from './costPolicyDetails';
import { PayEarlierInvoicesPreview } from './PayEarlierInvoicesPreview';
import { CostPolicyType } from './types';
import { useCostPolicyDetails } from './useCostPolicyDetails';
import { policyPeriodOptions } from './utils';

const CostPolicyDetailsDialog = lazyComponent(() =>
  import('./CostPolicyDetailsDialog').then((module) => ({
    default: module.CostPolicyDetailsDialog,
  })),
);
const CostPolicyFormDialog = lazyComponent(() =>
  import('./CostPolicyFormDialog').then((module) => ({
    default: module.CostPolicyFormDialog,
  })),
);

// One call per policy type; their option types differ only in the policy
// type, which the dialog treats alike.
const PARTIAL_UPDATE: Record<CostPolicyType, (options: any) => Promise<any>> = {
  project: marketplaceProjectEstimatedCostPoliciesPartialUpdate,
  organization: marketplaceCustomerEstimatedCostPoliciesPartialUpdate,
};

const BUTTON_LABELS: Record<FixOption['key'], () => string> = {
  add_credit: () => translate('Add credit'),
  pay_earlier_invoices: () => translate('Pay earlier invoices'),
  count_one_month: () => translate('Switch to one month'),
  edit_policy: () => translate('Edit policy'),
};

const Impact: FC<{ option: FixOption; current: number }> = ({
  option,
  current,
}) => (
  <div className="flex flex-wrap items-center gap-2 text-sm">
    <span className="text-secondary">
      {option.costAfter === null
        ? translate('Cost after credit stays {cost}', {
            cost: defaultCurrency(current),
          })
        : translate('Cost after credit {from} → {to}', {
            from: defaultCurrency(current),
            to: defaultCurrency(option.costAfter),
          })}
    </span>
    <Badge
      variant={option.resets ? 'success' : 'warning'}
      size="sm"
      shape="pill"
      tone="outline"
    >
      {option.resets
        ? translate('Resets the actions')
        : translate('Not enough on its own')}
    </Badge>
  </div>
);

interface CostPolicyFixDialogProps {
  resolve: {
    row;
    type: CostPolicyType;
    refetch?(): void;
    /** The policy's organization, when the opener knows it. */
    customerUuid?: string;
  };
}

/** The ways to bring a policy over its limit back to it, each with the cost
 * after credit it leaves and who may take it. For organization owners and
 * staff (staff alone for an organization's policy); others see the details
 * only. */
export const CostPolicyFixDialog: FC<CostPolicyFixDialogProps> = ({
  resolve,
}) => {
  const { type } = resolve;
  const { confirm, openDialog } = useModal();
  const {
    policy,
    credit,
    earlierInvoices,
    figures,
    isStaff,
    isOwnerOrStaff,
    refetch,
  } = useCostPolicyDetails(resolve.row, type, resolve.customerUuid);
  // Only what this user may do: an option they cannot take is not shown.
  const allOptions = getFixOptions(policy, {
    type,
    isStaff,
    isOwnerOrStaff,
    credit,
    payableNow: earlierInvoices ? Number(earlierInvoices.payable_now) : null,
  });
  const options = allOptions.filter((option) => option.allowed);

  const refreshAll = async () => {
    await refetch();
    resolve.refetch?.();
  };
  const creditMutation = useManagedMutation({
    mutationFn: (body: Record<string, unknown>) =>
      projectCreditsPartialUpdate({ path: { uuid: credit.uuid }, body }),
    successMessage: translate('Project credit has been updated.'),
    errorMessage: translate('Project credit could not be updated.'),
    invalidateQueries: [
      { queryKey: ['ProjectCreditEarlierInvoices'] },
      { queryKey: ['ProjectCreditData'] },
    ],
    refetch: refreshAll,
    closeModal: false,
  });
  const payMutation = useManagedMutation({
    mutationFn: (compensateIn: CompensateInEnum) =>
      projectCreditsPayEarlierInvoices({
        path: { uuid: credit.uuid },
        body: { compensate_in: compensateIn },
      }),
    successMessage: translate(
      'Earlier invoices are paid from the project credit.',
    ),
    errorMessage: translate('Earlier invoices could not be paid.'),
    invalidateQueries: [
      { queryKey: ['ProjectCreditEarlierInvoices'] },
      { queryKey: ['ProjectCreditData'] },
      { queryKey: ['PayEarlierInvoicesPreview'] },
    ],
    refetch: refreshAll,
    closeModal: false,
  });
  const policyMutation = useManagedMutation({
    mutationFn: (body: Record<string, unknown>) =>
      PARTIAL_UPDATE[type]({ path: { uuid: policy.uuid }, body }),
    successMessage: translate('Cost policy has been updated.'),
    errorMessage: translate('Cost policy could not be updated.'),
    refetch: refreshAll,
    closeModal: false,
  });
  const pending =
    creditMutation.isPending ||
    payMutation.isPending ||
    policyMutation.isPending;

  const take = async (option: FixOption) => {
    try {
      if (option.key === 'add_credit') {
        const suggested = Math.ceil(
          Number(credit.value) + figures.current - (option.costAfter ?? 0),
        );
        const result: any = await confirm(option.title, option.description, {
          positiveButton: translate('Update credit'),
          extraField: {
            resultKey: 'value',
            render: (value, onChange) => (
              <FormField className="mt-3">
                <FormLabel>{translate('Project credit')}</FormLabel>
                <NumberInput
                  value={value ?? suggested}
                  onValueChange={onChange}
                  min={0}
                />
                <FormText>
                  {translate('Now {value}.', {
                    value: defaultCurrency(credit.value),
                  })}
                </FormText>
              </FormField>
            ),
          },
        });
        await creditMutation.mutateAsync({
          value: String(result?.value ?? suggested),
        });
      } else if (option.key === 'pay_earlier_invoices') {
        const initial =
          credit.earlier_invoices_compensate_in ?? 'current_month';
        const result: any = await confirm(option.title, option.description, {
          positiveButton: translate('Pay earlier invoices'),
          negativeButton: translate('Cancel'),
          size: 'xl',
          extraField: {
            resultKey: 'compensate_in',
            render: (value, onChange) => (
              <PayEarlierInvoicesPreview
                creditUuid={credit.uuid}
                initial={initial}
                value={value}
                onChange={onChange}
              />
            ),
          },
        });
        await payMutation.mutateAsync(result?.compensate_in ?? initial);
      } else if (option.key === 'count_one_month') {
        await confirm(option.title, option.description, {
          positiveButton: translate('Switch to one month'),
        });
        await policyMutation.mutateAsync({
          period: policyPeriodOptions.oneMonth.value,
        });
      } else {
        openDialog(CostPolicyFormDialog, {
          resolve: { row: policy, refetch: resolve.refetch, type },
        });
      }
    } catch {
      // Cancelled, or the error was already shown.
    }
  };

  const triggered = Boolean(policy.trigger_status?.triggered);
  const needsBoth = getResetScenarios(policy).some(
    (scenario) => scenario.key === 'both',
  );

  return (
    <ModalDialog
      title={translate('Fix cost policy')}
      subtitle={getPolicySubtitle(policy)}
      footer={
        <>
          <BaseButton
            variant="tertiary"
            label={translate('Back to details')}
            onClick={() =>
              openDialog(CostPolicyDetailsDialog, { size: 'lg', resolve })
            }
          />
          <CloseDialogButton label={translate('Close')} />
        </>
      }
    >
      <p className="mb-2 text-secondary">
        <span className="font-medium text-primary">
          {translate('Counted period:')}
        </span>{' '}
        {getPolicyPeriodText(policy, earlierInvoices?.months?.[0]?.period)}
      </p>
      {triggered ? (
        <p className="mb-4">
          {translate(
            'The policy resets its actions at its next evaluation once the cost after credit, now {cost}, is at or below the limit, {limit}. Each option says what it leaves.',
            {
              cost: defaultCurrency(figures.current),
              limit: defaultCurrency(figures.limit),
            },
          )}
        </p>
      ) : (
        <AlertItem
          variant="success"
          className="mb-4"
          title={translate(
            'The cost after credit is now at or below the limit: the actions are reset at the next evaluation of the policy.',
          )}
        />
      )}
      {needsBoth ? (
        <AlertItem
          variant="info"
          className="mb-4"
          title={translate(
            'Lowering the cost takes two steps here: adding credit for this month and paying the earlier invoices. Either alone is not enough; raising the limit is the one option that resets the actions by itself.',
          )}
        />
      ) : null}
      <ul className="list-none ps-0 mb-0 flex flex-col gap-3">
        {options.map((option) => (
          <li
            key={option.key}
            className="rounded-lg border-[1px] border-secondary p-4"
            data-testid={`cost-policy-fix-${option.key}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{option.title}</span>
                  {option.audience === 'staff' ? <StaffOnlyIndicator /> : null}
                </div>
                <div className="text-secondary">{option.description}</div>
                <Impact option={option} current={figures.current} />
              </div>
              <BaseButton
                variant="tertiary"
                size="sm"
                className="shrink-0"
                label={BUTTON_LABELS[option.key]()}
                onClick={() => take(option)}
                disabled={pending}
                disabledReason={translate('An update is in progress.')}
              />
            </div>
          </li>
        ))}
      </ul>
    </ModalDialog>
  );
};
