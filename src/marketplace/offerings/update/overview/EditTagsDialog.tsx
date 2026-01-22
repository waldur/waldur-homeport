import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { components } from 'react-select';
import { change, Field, reduxForm } from 'redux-form';
import {
  marketplaceProviderOfferingsUpdateTags,
  marketplaceTagsCreate,
  NestedTag,
  ProviderOfferingDetails,
  Tag,
} from 'waldur-js-client';

import { FormFooter } from '@waldur/form';
import {
  AsyncCreatablePaginate,
  MultiSelectOption,
} from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { tagAutocomplete } from '@waldur/marketplace/common/autocompletes';
import { closeModalDialog } from '@waldur/modal/actions';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

// Custom Option that shows regular label for "create new" items, checkbox for existing items
const CreatableMultiSelectOption = (props) => {
  if (props.data?.__isNew__) {
    return <components.Option {...props}>{props.data.label}</components.Option>;
  }
  return <MultiSelectOption {...props} />;
};

const EDIT_TAGS_FORM_ID = 'EditTagsForm';

interface FormData {
  tags: (Tag | NestedTag)[];
}

type OwnProps = {
  resolve: { offering: ProviderOfferingDetails; refetch: () => void };
};

export const EditTagsDialog = reduxForm<FormData, OwnProps>({
  form: EDIT_TAGS_FORM_ID,
})(({ resolve, handleSubmit, invalid, submitting }) => {
  const dispatch = useDispatch();
  const [isCreating, setIsCreating] = useState(false);

  const submitRequest = useCallback(
    async (formData: FormData) => {
      try {
        const tagUuids = (formData.tags || [])
          .map((tag) => tag.uuid)
          .filter((uuid): uuid is string => Boolean(uuid));
        await marketplaceProviderOfferingsUpdateTags({
          path: { uuid: resolve.offering.uuid },
          body: { tags: tagUuids },
        });
        dispatch(showSuccess(translate('Tags have been updated.')));
        dispatch(closeModalDialog());
        if (resolve.refetch) {
          await resolve.refetch();
        }
      } catch (error) {
        dispatch(showErrorResponse(error, translate('Unable to update tags')));
      }
    },
    [resolve, dispatch],
  );

  useEffect(() => {
    if (resolve.offering.tags) {
      dispatch(change(EDIT_TAGS_FORM_ID, 'tags', resolve.offering.tags));
    }
  }, [dispatch, resolve.offering.tags]);

  const handleCreateTag = useCallback(
    async (
      inputValue: string,
      currentValue: (Tag | NestedTag)[],
      onChange: (v: (Tag | NestedTag)[]) => void,
    ) => {
      setIsCreating(true);
      try {
        const response = await marketplaceTagsCreate({
          body: { name: inputValue },
        });
        const newTag = response.data;
        onChange([...(currentValue || []), newTag]);
        dispatch(
          showSuccess(
            translate('Tag "{name}" has been created.', { name: inputValue }),
          ),
        );
      } catch (error) {
        dispatch(showErrorResponse(error, translate('Unable to create tag')));
      } finally {
        setIsCreating(false);
      }
    },
    [dispatch],
  );

  return (
    <form onSubmit={handleSubmit(submitRequest)}>
      <ModalDialog
        title={translate('Edit tags')}
        footer={
          <FormFooter
            submitting={submitting}
            invalid={invalid}
            submitLabel={translate('Save')}
          />
        }
      >
        <Field
          name="tags"
          component={(fieldProps) => (
            <AsyncCreatablePaginate
              placeholder={translate('Select or type to add tags...')}
              loadOptions={(query: string, prevOptions, { page }) =>
                tagAutocomplete(query, prevOptions, { page })
              }
              defaultOptions
              getOptionValue={(option) => option.uuid}
              getOptionLabel={(option) => option.name}
              value={fieldProps.input.value || []}
              onChange={(value) => fieldProps.input.onChange(value)}
              onCreateOption={(inputValue) =>
                handleCreateTag(
                  inputValue,
                  fieldProps.input.value,
                  fieldProps.input.onChange,
                )
              }
              noOptionsMessage={() => translate('No tags')}
              formatCreateLabel={(inputValue) =>
                translate('Create tag "{name}"', { name: inputValue })
              }
              isValidNewOption={(inputValue, _selectValue, selectOptions) => {
                const trimmed = inputValue.trim().toLowerCase();
                if (!trimmed) return false;
                // Don't show "Create" if an option with the same name already exists
                return !selectOptions.some(
                  (option) => option.name?.toLowerCase() === trimmed,
                );
              }}
              isClearable={true}
              isMulti={true}
              isLoading={isCreating}
              isDisabled={isCreating}
              components={{
                Option: CreatableMultiSelectOption,
                ValueContainer: components.ValueContainer,
              }}
            />
          )}
        />
      </ModalDialog>
    </form>
  );
});
