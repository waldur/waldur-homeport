import { useQueryClient } from '@tanstack/react-query';
import { FC } from 'react';
import { Alert } from 'react-bootstrap';
import { Form } from 'react-final-form';
import {
  Project,
  ProjectOrderAutoApproval as Rule,
  marketplaceProjectOrderAutoApprovalsCreate,
  marketplaceProjectOrderAutoApprovalsDestroy,
  marketplaceProjectOrderAutoApprovalsPartialUpdate,
} from 'waldur-js-client';

import { ENV } from '@/core/config';
import { SubmitButton, BooleanGroup, NumberGroup } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { useUser } from '@/workspace/hooks';

interface EditDialogProps {
  resolve: {
    project: Project;
    rule: Rule | null;
  };
}

interface FormValues {
  enabled: boolean;
  monthly_cost_limit?: string;
}

const validateLimit = (
  value: string | undefined,
  allValues: FormValues,
): string | undefined => {
  if (!allValues.enabled) return undefined;
  if (value == null || value === '') return translate('Required');
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0)
    return translate('Must be greater than zero');
  return undefined;
};

export const ProjectOrderAutoApprovalEditDialog: FC<EditDialogProps> = ({
  resolve,
}) => {
  const { project, rule } = resolve;
  const user = useUser();
  const queryClient = useQueryClient();

  const hasScopedPermission = hasPermission(user, {
    permission: PermissionEnum.APPROVE_ORDER,
    projectId: project.uuid,
    customerId: project.customer_uuid,
  });
  const showStaffWarning = user.is_staff && !hasScopedPermission;

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: ['ProjectOrderAutoApproval', project.uuid],
    });

  const upsertMutation = useManagedMutation<any, any, FormValues>({
    mutationFn: (values) => {
      const body = {
        enabled: values.enabled,
        monthly_cost_limit: values.monthly_cost_limit ?? '0',
      };
      if (rule) {
        return marketplaceProjectOrderAutoApprovalsPartialUpdate({
          path: { uuid: rule.uuid },
          body,
        });
      }
      return marketplaceProjectOrderAutoApprovalsCreate({
        body: {
          ...body,
          project: project.url,
        },
      });
    },
    successMessage: translate('Order auto-approval has been saved.'),
    errorMessage: translate('Unable to save order auto-approval settings.'),
    onSuccess: () => invalidate(),
  });

  const destroyMutation = useManagedMutation<any, any, void>({
    mutationFn: () =>
      marketplaceProjectOrderAutoApprovalsDestroy({
        path: { uuid: rule!.uuid },
      }),
    successMessage: translate('Order auto-approval has been removed.'),
    errorMessage: translate('Unable to remove order auto-approval settings.'),
    onSuccess: () => invalidate(),
  });

  const initialValues: FormValues = {
    enabled: rule ? rule.enabled !== false : true,
    monthly_cost_limit: rule?.monthly_cost_limit
      ? String(parseFloat(rule.monthly_cost_limit))
      : undefined,
  };

  return (
    <Form<FormValues>
      initialValues={initialValues}
      onSubmit={(values) => upsertMutation.mutateAsync(values)}
      render={({ handleSubmit, submitting, values }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Order auto-approval')}
            footer={
              <>
                {rule ? (
                  <SubmitButton
                    submitting={destroyMutation.isPending}
                    type="button"
                    onClick={() => destroyMutation.mutate()}
                    label={translate('Remove rule')}
                    className="btn btn-danger me-auto"
                  />
                ) : null}
                <CloseDialogButton />
                <SubmitButton
                  submitting={submitting || upsertMutation.isPending}
                  label={translate('Save')}
                  className="btn btn-primary"
                />
              </>
            }
          >
            {showStaffWarning && (
              <Alert variant="warning">
                {translate(
                  "You don't hold order-approval permission on this scope. Saving this rule will let orders be auto-approved without further review.",
                )}
              </Alert>
            )}

            <BooleanGroup
              name="enabled"
              label={translate('Enable auto-approval')}
              description={translate(
                'When enabled, qualifying orders below the monthly cost limit are auto-approved on the consumer side. Only plans without usage-based components qualify.',
              )}
            />

            <NumberGroup
              name="monthly_cost_limit"
              unit={ENV.plugins.WALDUR_CORE.CURRENCY_NAME}
              min={0}
              step="0.01"
              validate={validateLimit}
              disabled={!values.enabled}
              label={translate('Monthly cost limit')}
              required
            />
          </ModalDialog>
        </form>
      )}
    />
  );
};
