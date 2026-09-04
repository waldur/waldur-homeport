import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FORM_ERROR } from 'final-form';
import { FC, useCallback } from 'react';
import { Col, Row } from 'react-bootstrap';
import { Field, Form } from 'react-final-form';
import {
  rolesCreate,
  rolesRetrieve,
  rolesUpdate,
  RoleDetails,
  RoleModifyRequest,
  userPermissionsList,
} from 'waldur-js-client';

import { ENV } from '@/core/config';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { composeValidators, required, requiredArray } from '@/core/validators';
import { FormGroup, SelectGroup, StringGroup, SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { ROLE_TYPES } from '@/permissions/constants';
import { useNotify } from '@/store/notify';

import { getPermissionSummary, PermissionField } from './PermissionField';
import { getRoles, isRoleCode } from './utils';

import './RoleFormDialog.scss';

/**
 * Assignments pulled in one request to count the organizations a role reaches.
 * There is no aggregate endpoint for it, and `userPermissionsList` has no
 * field trimming, so the count is only shown when this single page covered
 * every assignment — never an approximation presented as fact.
 */
const ASSIGNMENT_SAMPLE = 200;

/** "Held by 3 users across 2 organizations." — pluralised for counts of one. */
const getReachSummary = (role, organizations: number | null) => {
  const users = role?.users_count ?? 0;
  const held =
    users === 1
      ? translate('1 user')
      : translate('{count} users', { count: users });
  if (organizations == null) {
    return translate('Held by {users}.', { users: held });
  }
  const across =
    organizations === 1
      ? translate('1 organization')
      : translate('{count} organizations', { count: organizations });
  return translate('Held by {users} across {organizations}.', {
    users: held,
    organizations: across,
  });
};

interface RoleFormDialogProps {
  resolve: {
    row?: RoleDetails;
    refetch(): void;
  };
}

export const RoleFormDialog: FC<RoleFormDialogProps> = (props) => {
  const row = props.resolve.row;
  const isEdit = Boolean(row);
  const { closeDialog } = useModal();
  const { showErrorResponse } = useNotify();
  const queryClient = useQueryClient();

  // The roles list response is trimmed and no longer carries `permissions`,
  // which this form edits. Fetch the full role on open when editing.
  // skipGlobalErrorRedirect: a failure here must surface inside the dialog,
  // not navigate the whole app away (e.g. a stale row whose role was deleted).
  const {
    data: role,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['role-details', row?.uuid],
    queryFn: () =>
      rolesRetrieve({ path: { uuid: row.uuid } }).then(
        (response) => response.data,
      ),
    enabled: isEdit,
    meta: { skipGlobalErrorRedirect: true },
  });

  // Staff editing a role need to see what it already grants and how far it
  // reaches before they change it.
  const { data: organizations } = useQuery({
    queryKey: ['role-organizations', row?.uuid],
    queryFn: async () => {
      const response = await userPermissionsList({
        query: {
          role_uuid: row.uuid,
          is_active: true,
          page_size: ASSIGNMENT_SAMPLE,
        },
      });
      const permissions = response.data ?? [];
      // A full page means there may be more, so the distinct count would be a
      // floor rather than a fact — say nothing instead of understating it.
      if (permissions.length >= ASSIGNMENT_SAMPLE) {
        return null;
      }
      // `customer_uuid` is null for call/proposal/offering-scoped grants, so
      // an empty set means "not answerable", not "zero organizations".
      return (
        new Set(permissions.map((item) => item.customer_uuid).filter(Boolean))
          .size || null
      );
    },
    enabled: isEdit && Boolean(role),
    meta: { skipGlobalErrorRedirect: true },
  });

  const onSubmit = useCallback(
    async (formData: RoleModifyRequest) => {
      try {
        if (isEdit) {
          await rolesUpdate({ path: { uuid: row.uuid }, body: formData });
        } else {
          await rolesCreate({ body: formData });
        }
        ENV.roles = await getRoles();
        if (isEdit) {
          queryClient.invalidateQueries({
            queryKey: ['role-details', row.uuid],
          });
        }
        closeDialog();
        props.resolve.refetch();
      } catch (e) {
        showErrorResponse(e, translate('Unable to save role.'));
        if (e.response && e.response.status === 400) {
          return {
            ...e.response.data,
            [FORM_ERROR]:
              e.response.data?.non_field_errors?.[0] || e.response.data?.detail,
          };
        }
        return { [FORM_ERROR]: translate('Unable to save role.') };
      }
    },
    [isEdit, row, queryClient, closeDialog, showErrorResponse, props.resolve],
  );

  if (isEdit && isLoading) {
    return (
      <ModalDialog title={translate('Edit role')}>
        <LoadingSpinner />
      </ModalDialog>
    );
  }

  // Never render a submittable form over a role we failed to load — otherwise
  // the edit degrades into a blank "New role" that still submits as an update.
  if (isEdit && isError) {
    return (
      <ModalDialog title={translate('Edit role')}>
        <LoadingErred
          loadData={refetch}
          message={translate('Unable to load role.')}
        />
      </ModalDialog>
    );
  }

  // An organization role's scope binds it to that organization, so it is fixed
  // — same as for system roles.
  const scopeLocked = role?.is_system_role || Boolean(role?.customer_uuid);

  return (
    <Form
      onSubmit={onSubmit}
      initialValues={role}
      // The role arrives from a query, so `initialValues` can change identity
      // after the form is already being edited; without this, a background
      // refetch would silently discard whatever has been ticked so far.
      keepDirtyOnReinitialize
    >
      {({ handleSubmit, submitting, invalid, values }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={isEdit ? translate('Edit role') : translate('New role')}
            subtitle={isEdit ? getReachSummary(role, organizations) : undefined}
            footer={
              <>
                {/* The whole role at a glance, beside the actions. */}
                <span className="text-muted me-auto role-form__summary">
                  {getPermissionSummary(
                    Array.isArray(values.permissions) ? values.permissions : [],
                  )}
                </span>
                <CloseDialogButton />
                <SubmitButton
                  disabled={invalid}
                  disabledReason={translate(
                    'Fill in the role details and select at least one permission.',
                  )}
                  submitting={submitting}
                  label={translate('Save')}
                />
              </>
            }
          >
            <Row className="role-form__fields">
              {/*
                Three fields across, each with a help icon, per the design.
                The human-readable label lives in `description`; `name` is the
                technical code, derived from this and the type. `description`
                is collected on create only: on edit, `description_<lang>`
                values are round-tripped through the same PUT, and
                modeltranslation resolves `description` from the active
                language field, so editing the base value here could silently
                be overwritten. Editing goes through the dedicated per-language
                dialog instead.
              */}
              <Col md={4}>
                {isEdit ? (
                  <StringGroup
                    name="description"
                    label={translate('Role name')}
                    disabled
                    spaceless
                    tooltip={translate(
                      'Editable, together with its translations, from the "Edit name translations" action.',
                    )}
                    tooltipEnd
                    tooltipProps={{ placement: 'bottom' }}
                  />
                ) : (
                  <StringGroup
                    name="description"
                    validate={required}
                    label={translate('Role name')}
                    spaceless
                    tooltip={translate(
                      'Human-readable name shown to users throughout the portal.',
                    )}
                    tooltipEnd
                    tooltipProps={{ placement: 'bottom' }}
                    required
                  />
                )}
              </Col>
              <Col md={4}>
                <StringGroup
                  name="name"
                  label={translate('Code')}
                  spaceless
                  disabled={isEdit}
                  placeholder="PROJECT.RESEARCHER"
                  tooltip={translate(
                    'Permanent technical identifier used by the API and by permission checks. It cannot be changed once the role has been created.',
                  )}
                  tooltipEnd
                  tooltipProps={{ placement: 'bottom' }}
                  validate={
                    isEdit ? required : composeValidators(required, isRoleCode)
                  }
                  required
                />
              </Col>
              <Col md={4}>
                <SelectGroup
                  name="content_type"
                  validate={required}
                  isDisabled={scopeLocked}
                  options={ROLE_TYPES}
                  simpleValue
                  label={translate('Type')}
                  required
                  spaceless
                />
              </Col>
            </Row>

            <FormGroup required hideLabel spaceless>
              <Field
                component={PermissionField}
                name="permissions"
                validate={requiredArray}
              />
            </FormGroup>
          </ModalDialog>
        </form>
      )}
    </Form>
  );
};
