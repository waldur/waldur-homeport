import arrayMutators from 'final-form-arrays';
import { useCallback, useRef, useState } from 'react';
import { Form, FormSpy } from 'react-final-form';

import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import {
  getWarningSignature,
  isExistingRoleBlocking,
  shouldHoldForWarnings,
} from '@/permissions/existingRoles';
import { useNotify } from '@/store/notify';

import { RestrictionsInfoCard } from '../RestrictionsInfoCard';
import { GroupInviteRow, InvitationContext } from '../types';
import { useInvitationCreateDialog } from '../useInvitationCreateDialog';

import { BulkUpload, EmailRolePairs } from './BulkUpload';
import { CustomMessageWrapper } from './CustomMessageWrapper';
import { EmailsListGroupWrapper } from './EmailsListGroupWrapper';
import { InvitationCreateDialogFooter } from './InvitationCreateDialogFooter';

import './InvitationCreateDialog.scss';

interface OwnProps {
  resolve: InvitationContext;
}

const initialValues = { rows: [{}] };

export const InvitationCreateDialog = ({ resolve }: OwnProps) => {
  const { showErrorResponse } = useNotify();
  const {
    checkDuplicates,
    createInvitations,
    roles,
    defaultRole,
    defaultProject,
  } = useInvitationCreateDialog(resolve);

  const [step, setStep] = useState<1 | 2>(1);
  const [_duplicateEmails, setDuplicateEmails] = useState<string[]>([]);
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);
  const rowsSnapshotRef = useRef<string>('');
  const acknowledgedWarningsRef = useRef<string>('');

  const handleContinueClick = useCallback(
    async (formApi: {
      getState: () => { values: { rows?: GroupInviteRow[] }; valid?: boolean };
      change: (name: string, value: unknown) => void;
    }) => {
      const formValues = formApi.getState().values;
      const rows = formValues.rows ?? [];

      // 1. In-form duplicates: (email + role) pairs that appear more than once – checked only on Continue
      const pairCounts = new Map<string, number>();
      rows.forEach((row: GroupInviteRow) => {
        const email = row?.email?.trim();
        const roleUuid = row?.role_project?.role?.uuid;
        if (email && roleUuid) {
          const key = `${email}\0${roleUuid}`;
          pairCounts.set(key, (pairCounts.get(key) ?? 0) + 1);
        }
      });
      const duplicateInFormPairs = Array.from(pairCounts.entries())
        .filter(([, count]) => count > 1)
        .map(([key]) => {
          const [email, roleUuid] = key.split('\0');
          return { email, roleUuid };
        });

      if (duplicateInFormPairs.length > 0) {
        formApi.change('_duplicateInFormEmails', duplicateInFormPairs);
        rows.forEach((row: GroupInviteRow, i: number) => {
          if (row?.email) {
            formApi.change(`rows.${i}.email`, row.email);
          }
        });
        return false;
      }

      formApi.change('_duplicateInFormEmails', undefined);

      setIsCheckingDuplicates(true);
      try {
        const { duplicatePairs, existingRoleHits } = await checkDuplicates(
          formValues as Parameters<typeof checkDuplicates>[0],
        );

        // The same role is rejected by the backend unconditionally, and a
        // different one whenever multiple roles per scope are disabled. Anything
        // else is legitimate, so it only warns and never gates Continue.
        const blockingRoleHits = existingRoleHits.filter(
          isExistingRoleBlocking,
        );
        const warningRoleHits = existingRoleHits.filter(
          (hit) => !isExistingRoleBlocking(hit),
        );
        // Warnings live on the row list, which only exists on step 1, so they
        // are always written before deciding whether to advance.
        formApi.change(
          '_existingRoleWarnings',
          warningRoleHits.length > 0 ? warningRoleHits : undefined,
        );
        const warningSignature = getWarningSignature(warningRoleHits);

        if (duplicatePairs.length > 0 || blockingRoleHits.length > 0) {
          setDuplicateEmails(duplicatePairs.map((p) => p.email));
          formApi.change(
            '_duplicateEmails',
            duplicatePairs.length > 0 ? duplicatePairs : undefined,
          );
          formApi.change(
            '_existingRoleBlocks',
            blockingRoleHits.length > 0 ? blockingRoleHits : undefined,
          );
          // The warnings for the remaining rows sit on screen next to the
          // errors, so they count as seen.
          acknowledgedWarningsRef.current = warningSignature;
          rows.forEach((row: GroupInviteRow, i: number) => {
            if (row?.email && row?.role_project?.role?.uuid) {
              const roleUuid = row.role_project.role.uuid;
              const isFlagged =
                duplicatePairs.some(
                  (p) => p.email === row.email && p.roleUuid === roleUuid,
                ) ||
                blockingRoleHits.some(
                  (hit) => hit.email === row.email && hit.roleUuid === roleUuid,
                );
              if (isFlagged) {
                formApi.change(`rows.${i}.email`, row.email);
              }
            }
          });
          return false;
        }
        setDuplicateEmails([]);
        formApi.change('_duplicateEmails', undefined);
        formApi.change('_existingRoleBlocks', undefined);

        // Advancing unmounts the row list, so hold on step 1 the first time a
        // warning shows up. A second Continue goes through: these invitations
        // are legitimate, the inviter just gets told before sending them.
        if (
          shouldHoldForWarnings(
            warningRoleHits,
            acknowledgedWarningsRef.current,
          )
        ) {
          acknowledgedWarningsRef.current = warningSignature;
          return false;
        }
        acknowledgedWarningsRef.current = warningSignature;
        return true;
      } catch (e) {
        showErrorResponse(
          e,
          translate('Unable to check for duplicate invitations.'),
        );
        return false;
      } finally {
        setIsCheckingDuplicates(false);
      }
    },
    [checkDuplicates],
  );

  const populateRows = useCallback(
    (items: EmailRolePairs, change: (field: string, value: any) => void) => {
      const rows: GroupInviteRow[] = [];
      items.forEach((item) => {
        if (item.role === '') {
          rows.push({
            email: item.email,
            role_project: null,
          });
        } else {
          const role = item.role
            ? roles.find(
                (role) =>
                  role.name.toLocaleLowerCase() ===
                    item.role.toLocaleLowerCase() ||
                  role.description.toLocaleLowerCase() ===
                    item.role.toLocaleLowerCase(),
              )
            : defaultRole;
          const project =
            item.project && resolve.roleTypes?.includes('customer')
              ? resolve.customer?.projects?.find(
                  (project) =>
                    project.name.toLocaleLowerCase() ===
                      item.project.toLocaleLowerCase() ||
                    project.uuid.toLocaleLowerCase() ===
                      item.project.toLocaleLowerCase(),
                )
              : defaultProject;
          rows.push({
            email: item.email,
            role_project: { role, project },
          });
        }
      });
      change('rows', rows);
    },
    [defaultRole, defaultProject, roles],
  );

  return (
    <Form
      onSubmit={createInvitations}
      initialValues={initialValues}
      mutators={{ ...arrayMutators }}
      render={({ handleSubmit, submitting, valid, form }) => (
        <form onSubmit={handleSubmit} className="invitation-create-dialog">
          <ModalDialog
            title={
              resolve.scopeLabel
                ? translate('Invite users to {label}', {
                    label: resolve.scopeLabel,
                  })
                : translate('Invite by email')
            }
            subtitle={translate(
              "We'll email them instructions and a link to accept the invitation.",
            )}
            footer={
              <InvitationCreateDialogFooter
                resolve={resolve}
                defaultProject={defaultProject}
                setStep={setStep}
                step={step}
                submitting={submitting}
                valid={valid}
                isCheckingDuplicates={isCheckingDuplicates}
                onContinueClick={handleContinueClick}
                form={form}
              />
            }
          >
            {step === 1 && resolve.enableBulkUpload ? (
              <BulkUpload
                onImport={(items) => populateRows(items, form.change)}
              />
            ) : null}
            {step === 1 && (
              <RestrictionsInfoCard
                customer={resolve.customer}
                project={resolve.project}
              />
            )}
            {step === 1 && (
              <FormSpy
                subscription={{ values: true }}
                onChange={(state) => {
                  const rows = (state.values?.rows ?? []) as GroupInviteRow[];
                  const snapshot = rows
                    .map(
                      (r) =>
                        `${r?.email ?? ''}\0${r?.role_project?.role?.uuid ?? ''}`,
                    )
                    .join('\n');
                  const prev = rowsSnapshotRef.current;
                  if (prev !== '' && prev !== snapshot) {
                    rowsSnapshotRef.current = snapshot;
                    rows.forEach((row: GroupInviteRow, i: number) => {
                      if (row?.email) {
                        form.change(`rows.${i}.email`, row.email);
                      }
                    });
                  } else if (prev === '') {
                    rowsSnapshotRef.current = snapshot;
                  }
                }}
              />
            )}
            <div>
              {step === 1 ? (
                <EmailsListGroupWrapper
                  roles={roles}
                  customer={resolve.customer}
                  project={resolve.project}
                  disabled={submitting}
                />
              ) : step === 2 ? (
                <CustomMessageWrapper />
              ) : null}
            </div>
          </ModalDialog>
        </form>
      )}
    />
  );
};
