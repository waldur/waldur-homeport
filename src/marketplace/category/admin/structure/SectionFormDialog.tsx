import { FC } from 'react';
import { Form } from 'react-final-form';
import {
  marketplaceSectionsCreate,
  marketplaceSectionsPartialUpdate,
} from 'waldur-js-client';

import { required } from '@/core/validators';
import { BooleanGroup, StringGroup, SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { Category } from '@/marketplace/types';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

// A title of only spaces would be sent empty and refused by the server.
const requiredText = (value: unknown) =>
  required(typeof value === 'string' ? value.trim() : value);

interface SectionFormValues {
  title: string;
  is_standalone: boolean;
}

interface SectionFormDialogProps {
  resolve: {
    category: Category;
    section?: { key: string; title: string; is_standalone?: boolean };
    refetch: () => void;
  };
}

export const SectionFormDialog: FC<SectionFormDialogProps> = ({
  resolve: { category, section, refetch },
}) => {
  const isEdit = Boolean(section);

  const mutation = useManagedMutation<unknown, unknown, SectionFormValues>({
    // The key is left to the server: it is a primary key shared by every
    // category, so only the server can tell whether a candidate is free.
    mutationFn: (values) =>
      isEdit
        ? marketplaceSectionsPartialUpdate({
            path: { key: section.key },
            body: values,
          })
        : marketplaceSectionsCreate({
            body: { ...values, category: category.url },
          }),
    successMessage: isEdit
      ? translate('The section has been updated.')
      : translate('The section has been added.'),
    errorMessage: isEdit
      ? translate('Unable to update the section.')
      : translate('Unable to add the section.'),
    refetch,
  });

  return (
    <Form<SectionFormValues>
      onSubmit={(values) => mutation.mutateAsync(values).catch(() => {})}
      initialValues={{
        title: section?.title ?? '',
        is_standalone: section?.is_standalone ?? false,
      }}
      render={({ handleSubmit, submitting, pristine, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={
              isEdit
                ? translate('Edit section')
                : translate('Add section to {category}', {
                    category: category.title,
                  })
            }
            footer={
              <SubmitButton
                disabled={invalid || pristine}
                submitting={submitting}
                label={isEdit ? translate('Save') : translate('Add')}
              />
            }
          >
            <StringGroup
              name="title"
              label={translate('Title')}
              validate={requiredText}
              required
            />
            <BooleanGroup
              name="is_standalone"
              label={translate('Show as a separate tab')}
              description={translate(
                'On offering pages, show this section on a tab of its own instead of with the other attributes.',
              )}
            />
          </ModalDialog>
        </form>
      )}
    />
  );
};
