import { Form } from 'react-final-form';
import {
  RemoteProject,
  LinkRequest,
  openportalRemoteProjectsSetLinks,
} from 'waldur-js-client';

import { StringGroup, SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

interface FormValues {
  award: LinkRequest;
  call: LinkRequest;
  project_link: LinkRequest;
  renewal: LinkRequest;
}

interface SetLinksDialogProps {
  row: RemoteProject;
  resolve: {
    refetch: () => Promise<void> | void;
  };
}

const emptyLink = (): LinkRequest => ({ id: '', url: '' });

const cleanLink = (link: LinkRequest): LinkRequest | null =>
  link?.id || link?.url
    ? { id: link.id || undefined, url: link.url || undefined }
    : null;

const LinkFields = ({
  name,
  label,
}: {
  name: 'award' | 'call' | 'project_link' | 'renewal';
  label: string;
}) => (
  <div className="mb-3">
    <div className="fw-semibold mb-1">{label}</div>
    <div className="row g-2">
      <div className="col-sm-5">
        <StringGroup
          name={`${name}.id`}
          placeholder={translate('Identifier, e.g. EP/X000000/1')}
          spaceless
        />
      </div>
      <div className="col-sm-7">
        <StringGroup
          name={`${name}.url`}
          placeholder={translate('URL')}
          spaceless
        />
      </div>
    </div>
  </div>
);

export const SetLinksDialog: React.FC<SetLinksDialogProps> = ({
  row,
  resolve,
}) => {
  const mutation = useManagedMutation<any, any, FormValues>({
    mutationFn: (values) =>
      openportalRemoteProjectsSetLinks({
        path: { uuid: row.uuid },
        body: {
          award: cleanLink(values.award),
          call: cleanLink(values.call),
          project_link: cleanLink(values.project_link),
          renewal: cleanLink(values.renewal),
        },
      }),
    successMessage: translate('Links have been updated.'),
    errorMessage: translate('Unable to update links.'),
    refetch: resolve.refetch,
  });

  return (
    <Form<FormValues>
      onSubmit={(values) => mutation.mutateAsync(values)}
      initialValues={{
        award: row.link_award ?? emptyLink(),
        call: row.link_call ?? emptyLink(),
        project_link: row.link_project ?? emptyLink(),
        renewal: row.link_renewal ?? emptyLink(),
      }}
      subscription={{ submitting: true, invalid: true }}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit} noValidate>
          <ModalDialog
            title={translate('Set links')}
            footer={
              <SubmitButton
                submitting={submitting}
                invalid={invalid}
                label={translate('Save')}
              />
            }
          >
            <LinkFields name="award" label={translate('Award')} />
            <LinkFields name="call" label={translate('Funding call')} />
            <LinkFields name="project_link" label={translate('Project page')} />
            <LinkFields name="renewal" label={translate('Renewal')} />
          </ModalDialog>
        </form>
      )}
    />
  );
};
