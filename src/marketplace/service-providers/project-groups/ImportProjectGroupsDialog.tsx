import { FC, useState } from 'react';
import { Form } from 'react-final-form';
import {
  marketplaceServiceProviderProjectGroupsImportGroups,
  ServiceProvider,
} from 'waldur-js-client';

import { AlertItem } from 'waldur-ui';

import { required } from '@/core/validators';
import { SubmitButton, TextGroup } from '@/form';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { OutsideRangeField } from './OutsideRangeField';
import { useInlineErrorToast } from './useInlineErrorToast';
import {
  formatValidationErrors,
  getValidationErrors,
  parseGroupLines,
  PROJECT_GROUP_QUERY_KEYS,
} from './utils';

interface ImportProjectGroupsDialogProps {
  resolve: { provider: ServiceProvider; refetch: () => void };
}

interface FormValues {
  lines?: string;
  allow_outside_range?: boolean;
}

const validateLines = (value?: string) => {
  const { groups, errors } = parseGroupLines(value);
  if (errors.length) {
    return errors.join(' ');
  }
  if (!groups.length) {
    return translate('Enter at least one group.');
  }
};

/** Adopt several existing groups at once; all of them or none. */
export const ImportProjectGroupsDialog: FC<ImportProjectGroupsDialogProps> = ({
  resolve: { provider, refetch },
}) => {
  const [problems, setProblems] = useState<string[]>([]);
  const toastUnshownError = useInlineErrorToast(
    translate('Unable to import project groups.'),
  );

  const mutation = useManagedMutation<any, any, FormValues>({
    mutationFn: (values) =>
      marketplaceServiceProviderProjectGroupsImportGroups({
        body: {
          service_provider: provider.uuid,
          groups: parseGroupLines(values.lines).groups,
          allow_outside_range: Boolean(values.allow_outside_range),
        },
      }),
    successMessage: translate('Project groups have been imported.'),
    invalidateQueries: PROJECT_GROUP_QUERY_KEYS,
    // A refusal is listed in the dialog; anything else is a toast.
    onError: toastUnshownError,
    refetch,
  });

  const onSubmit = async (values: FormValues) => {
    setProblems([]);
    try {
      await mutation.mutateAsync(values);
    } catch (error) {
      const data = getValidationErrors(error);
      if (data) {
        setProblems(
          formatValidationErrors(data, parseGroupLines(values.lines).lines),
        );
      }
    }
  };

  return (
    <Form<FormValues>
      onSubmit={onSubmit}
      render={({ handleSubmit, submitting, invalid, dirtySinceLastSubmit }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Import groups')}
            footer={
              <SubmitButton
                disabled={invalid}
                submitting={submitting}
                label={translate('Import')}
              />
            }
          >
            <p className="text-muted">
              {translate(
                'Adopt groups your directory already holds, one per line: the project’s UUID or short name, the GID and, optionally, the group name, separated by commas. Either every line is imported or, if any is refused, none.',
              )}
            </p>
            {/* The list describes the lines as sent; editing them makes it stale. */}
            {problems.length > 0 && !dirtySinceLastSubmit && (
              <AlertItem
                variant="error"
                className="mb-4"
                title={translate('Nothing was imported.')}
                body={
                  <ul className="mb-0 ps-4" data-testid="import-problems">
                    {problems.map((problem, index) => (
                      <li key={`${index}-${problem}`}>{problem}</li>
                    ))}
                  </ul>
                }
              />
            )}
            <TextGroup
              name="lines"
              label={translate('Groups')}
              placeholder={
                'project,gid,name\n0b4a1c2d3e4f5a6b7c8d9e0f1a2b3c4d,20001,my-project'
              }
              rows={8}
              required
              validate={(value) => required(value) || validateLines(value)}
              disabled={submitting}
            />
            <OutsideRangeField disabled={submitting} />
          </ModalDialog>
        </form>
      )}
    />
  );
};
