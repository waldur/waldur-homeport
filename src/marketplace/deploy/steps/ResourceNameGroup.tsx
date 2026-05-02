import { LightbulbFilamentIcon } from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { Field } from 'redux-form';
import { marketplaceResourcesSuggestName } from 'waldur-js-client';

import { Tip } from '@/core/Tooltip';
import { getNameFieldValidators } from '@/core/validators';
import { FormGroup, StringField } from '@/form';
import { translate } from '@/i18n';
import { orderFormAttributesSelector } from '@/marketplace/deploy/selectors';
import { useNotify } from '@/store/notify';
import { ActionButton } from '@/table/ActionButton';

const ResourceNameField = (props) => {
  const { showErrorResponse } = useNotify();
  const project = props.project;
  const attributes = useSelector(orderFormAttributesSelector);
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
      showErrorResponse(error as any);
    },
  });

  return (
    <div className="d-flex justify-content-between">
      <div className="flex-grow-1 me-3 ">
        <StringField input={props.input} isInvalid={props.isInvalid} />
      </div>
      {project ? (
        <ActionButton
          variant="tertiary"
          action={() => suggestName()}
          disabled={isLoading}
          disabledReason={translate('Loading suggestion')}
          iconNode={<LightbulbFilamentIcon weight="bold" />}
          title={translate('Suggest name')}
        />
      ) : (
        <Tip
          id="ResourceNameField"
          label={translate('Organization and project need to be selected.')}
        >
          <ActionButton
            variant="tertiary"
            disabled
            disabledReason={translate(
              'Organization and project selection required',
            )}
            action={() => {}}
            iconNode={<LightbulbFilamentIcon weight="bold" />}
            title={translate('Suggest name')}
          />
        </Tip>
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
    label={nameLabel}
    component={FormGroup}
    required={true}
    description={translate('This name will be visible in accounting data.')}
    validate={nameValidate}
  >
    <ResourceNameField
      offering={offering}
      project={project}
      formatSuggestedName={props.formatSuggestedName}
    />
  </Field>
);
