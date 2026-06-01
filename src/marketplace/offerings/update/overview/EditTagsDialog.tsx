import { useCallback, useState } from 'react';
import { Field, Form } from 'react-final-form';
import { components } from 'react-select';
import {
  marketplaceProviderOfferingsUpdateTags,
  marketplaceTagsCreate,
  NestedTag,
  ProviderOfferingDetails,
  Tag,
} from 'waldur-js-client';

import { FormFooter } from '@/form';
import { AsyncCreatableSelect, MultiSelectOption } from '@/form/select';
import { translate } from '@/i18n';
import { tagAutocomplete } from '@/marketplace/common/autocompletes';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { useNotify } from '@/store/notify';

// Custom Option that shows regular label for "create new" items, checkbox for existing items
const CreatableMultiSelectOption = (props) => {
  if (props.data?.__isNew__) {
    return <components.Option {...props}>{props.data.label}</components.Option>;
  }
  return <MultiSelectOption {...props} />;
};

interface FormData {
  tags: (Tag | NestedTag)[];
}

type OwnProps = {
  resolve: { offering: ProviderOfferingDetails; refetch: () => void };
};

export const EditTagsDialog = ({ resolve }: OwnProps) => {
  const { showErrorResponse, showSuccess } = useNotify();

  const [isCreating, setIsCreating] = useState(false);

  const updateMutation = useManagedMutation<any, any, FormData>({
    mutationFn: (formData) => {
      const tagUuids = (formData.tags || [])
        .map((tag) => tag.uuid)
        .filter((uuid): uuid is string => Boolean(uuid));
      return marketplaceProviderOfferingsUpdateTags({
        path: { uuid: resolve.offering.uuid },
        body: { tags: tagUuids },
      });
    },
    successMessage: translate('Tags have been updated.'),
    errorMessage: translate('Unable to update tags'),
    refetch: resolve.refetch,
  });

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
        showSuccess(
          translate('Tag "{name}" has been created.', { name: inputValue }),
        );
      } catch (error) {
        showErrorResponse(error, translate('Unable to create tag'));
      } finally {
        setIsCreating(false);
      }
    },
    [showErrorResponse, showSuccess],
  );

  return (
    <Form<FormData>
      initialValues={{ tags: resolve.offering.tags }}
      onSubmit={(values) => updateMutation.mutateAsync(values)}
      render={({ handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Edit tags')}
            footer={<FormFooter submitLabel={translate('Save')} />}
          >
            <Field
              name="tags"
              component={(fieldProps) => (
                <AsyncCreatableSelect
                  placeholder={translate('Select or type to add tags...')}
                  loadOptions={tagAutocomplete}
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
                  isValidNewOption={(
                    inputValue,
                    _selectValue,
                    selectOptions,
                  ) => {
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
      )}
    />
  );
};
