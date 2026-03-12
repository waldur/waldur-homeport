import { PlusCircleIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Field, Form } from 'react-final-form';
import { useDispatch } from 'react-redux';
import {
  marketplaceSectionsCreate,
  marketplaceSectionsPartialUpdate,
} from 'waldur-js-client';
import { NestedSection } from 'waldur-js-client';

import { required } from '@waldur/core/validators';
import { StringField } from '@waldur/form';
import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { Category } from '@waldur/marketplace/types';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

const slugify = (text: string) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^\w-]+/g, '')
    .replace(/-+/g, '_');

const getCategoryUrl = (category: Category) =>
  category.url || `/api/marketplace-categories/${category.uuid}/`;

interface SectionFormDialogProps {
  resolve: {
    category: Category;
    section?: NestedSection;
    refetch: () => void;
  };
}

export const SectionFormDialog: FC<SectionFormDialogProps> = ({
  resolve: { category, section, refetch },
}) => {
  const dispatch = useDispatch();
  const isEdit = Boolean(section?.key);

  const onSubmit = async (formData: { title: string }) => {
    try {
      if (isEdit) {
        await marketplaceSectionsPartialUpdate({
          path: { key: section.key },
          body: { title: formData.title },
        });
      } else {
        const categorySlug = slugify(category.title || category.uuid);
        const sectionSlug = slugify(formData.title);
        const key = `${categorySlug}_${sectionSlug}`;
        await marketplaceSectionsCreate({
          body: {
            key,
            title: formData.title,
            category: getCategoryUrl(category),
            is_standalone: false,
          },
        });
      }

      refetch();
      dispatch(
        showSuccess(
          isEdit
            ? translate('The section has been updated.')
            : translate('The section has been added.'),
        ),
      );
      dispatch(closeModalDialog());
    } catch (e) {
      dispatch(
        showErrorResponse(
          e,
          isEdit
            ? translate('Unable to update section.')
            : translate('Unable to add section.'),
        ),
      );
    }
  };

  const title = isEdit
    ? translate('Edit section')
    : translate('Add sections to category {name}', {
        name: category.title || category.uuid,
      });

  return (
    <Form
      onSubmit={onSubmit}
      initialValues={{ title: section?.title || '' }}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={title}
            iconNode={<PlusCircleIcon weight="bold" />}
            iconColor="success"
            closeButton
            footer={
              <>
                <CloseDialogButton />
                <SubmitButton
                  submitting={submitting}
                  disabled={invalid}
                  label={translate('Confirm')}
                />
              </>
            }
          >
            <FormGroup label={translate('Name')} required>
              <Field
                name="title"
                validate={required}
                component={StringField as any}
                placeholder={translate('Type a name')}
              />
            </FormGroup>
          </ModalDialog>
        </form>
      )}
    />
  );
};
