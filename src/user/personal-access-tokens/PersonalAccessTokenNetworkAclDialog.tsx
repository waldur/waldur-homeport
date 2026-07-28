import { Form } from 'react-final-form';
import { personalAccessTokensSetNetworkAcl } from 'waldur-js-client';

import { StringGroup } from '@/form';
import { SubmitButton } from '@/form/SubmitButton';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ModalDialog } from '@/modal/ModalDialog';
import { useNotify } from '@/store/notify';

interface FormValues {
  allowed_networks?: string;
}

export const PersonalAccessTokenNetworkAclDialog = ({ resolve }) => {
  const { row, refetch } = resolve;
  const { closeDialog } = useModal();
  const { showErrorResponse, showSuccess } = useNotify();

  const processRequest = async (values: FormValues) => {
    try {
      await personalAccessTokensSetNetworkAcl({
        path: { uuid: row.uuid },
        body: {
          // No client-side CIDR validation: the backend validator owns the
          // rules and returns a per-entry message (including the canonical
          // form to use when host bits are set), so duplicating it here would
          // only drift.
          allowed_networks: (values.allowed_networks ?? '')
            .split(',')
            .map((entry: string) => entry.trim())
            .filter(Boolean),
        },
      });
      showSuccess(translate('Network ACL has been updated.'));
      if (refetch) {
        await refetch();
      }
      closeDialog();
    } catch (e) {
      showErrorResponse(e, translate('Unable to update network ACL.'));
    }
  };

  return (
    <Form<FormValues>
      onSubmit={processRequest}
      initialValues={{
        allowed_networks: (row.allowed_networks ?? []).join(', '),
      }}
      render={({ handleSubmit, submitting }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Edit allowed networks')}
            subtitle={row.name}
            footer={
              <SubmitButton
                submitting={submitting}
                label={translate('Save')}
                className="btn btn-primary"
              />
            }
          >
            <StringGroup
              name="allowed_networks"
              label={translate('Allowed networks')}
              description={translate(
                'Comma-separated list of CIDR networks, e.g. 203.0.113.0/24. Leave empty to allow any source.',
              )}
            />
          </ModalDialog>
        </form>
      )}
    />
  );
};
