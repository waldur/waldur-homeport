import { LightbulbFilamentIcon } from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import { Field } from 'react-final-form';
import { marketplaceResourcesSuggestName } from 'waldur-js-client';

import { Tooltip, BaseButton } from 'waldur-ui';

import { getNameFieldValidators, composeValidators } from '@/core/validators';
import { FormGroup, StringField } from '@/form';
import { translate } from '@/i18n';
import { useOrderFormData } from '@/marketplace/deploy/selectors';
import { useNotify } from '@/store/notify';

const ResourceNameField = (props) => {
  const { showErrorResponse } = useNotify();
  const project = props.project;
  const { attributes = {} } = useOrderFormData();
  const { mutate: suggestName, isPending: isLoading } = useMutation({
    mutationFn: async () => {
      const response = await marketplaceResourcesSuggestName({
        body: {
          project: project.uuid,
          offering: props.offering.uuid,
          attributes,
        },
      });
      const name = response.data['name'];
      props.input.onChange(
        props.formatSuggestedName ? props.formatSuggestedName(name) : name,
      );
    },
    onError: (error) => {
      showErrorResponse(error);
    },
  });

  return (
    <div className="d-flex justify-content-between">
      <div className="flex-grow-1 me-3 ">
        <StringField input={props.input} meta={props.meta} id={props.id} />
      </div>
      {project ? (
        <BaseButton
          variant="tertiary"
          onClick={() => suggestName()}
          disabled={isLoading}
          disabledReason={translate('Loading suggestion')}
          iconNode={<LightbulbFilamentIcon weight="bold" />}
          label={translate('Suggest name')}
          size="lg"
        />
      ) : (
        <Tooltip
          label={translate('Organization and project need to be selected.')}
        >
          <BaseButton
            variant="tertiary"
            disabled
            disabledReason={translate(
              'Organization and project selection required',
            )}
            onClick={() => {}}
            iconNode={<LightbulbFilamentIcon weight="bold" />}
            label={translate('Suggest name')}
            size="lg"
          />
        </Tooltip>
      )}
    </div>
  );
};
export const ResourceNameGroup = ({
  nameValidate = getNameFieldValidators(),
  nameLabel = translate('Name'),
  offering,
  project,
  ...props
}) => (
  <Field
    name="attributes.name"
    validate={
      Array.isArray(nameValidate)
        ? composeValidators(...nameValidate)
        : nameValidate
    }
  >
    {({ input, meta }) => (
      <FormGroup
        label={nameLabel}
        required={true}
        description={translate('This name will be visible in accounting data.')}
        meta={meta}
        controlId={input.name}
      >
        <ResourceNameField
          offering={offering}
          project={project}
          formatSuggestedName={props.formatSuggestedName}
          input={input}
          meta={meta}
        />
      </FormGroup>
    )}
  </Field>
);
