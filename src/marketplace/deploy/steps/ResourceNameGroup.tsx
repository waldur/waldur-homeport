import { LightbulbFilamentIcon } from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import { Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { Field } from 'redux-form';
import { marketplaceResourcesSuggestName } from 'waldur-js-client';

import { Tip } from '@waldur/core/Tooltip';
import { getNameFieldValidators } from '@waldur/core/validators';
import { FormGroup, StringField } from '@waldur/form';
import { translate } from '@waldur/i18n';

import { orderProjectSelector } from '../selectors';

const ResourceNameField = (props) => {
  const project = useSelector(orderProjectSelector);
  const { mutate: suggestName, isPending: isLoading } = useMutation({
    mutationFn: async () => {
      const response = await marketplaceResourcesSuggestName({
        body: {
          project: project.uuid,
          offering: props.offering.uuid,
        },
      });
      props.input.onChange(response.data['name']);
    },
  });

  return (
    <div className="d-flex justify-content-between">
      <div className="flex-grow-1 me-3 ">
        <StringField input={props.input} />
      </div>
      {project ? (
        <Button
          variant="outline"
          className="btn-outline-default"
          onClick={() => suggestName()}
          disabled={isLoading}
        >
          <span className="svg-icon svg-icon-2">
            <LightbulbFilamentIcon weight="bold" />
          </span>
          {translate('Suggest name')}
        </Button>
      ) : (
        <Tip
          id="ResourceNameField"
          label={translate('Organization and project need to be selected.')}
        >
          <Button variant="outline" className="btn-outline-default" disabled>
            <span className="svg-icon svg-icon-2">
              <LightbulbFilamentIcon weight="bold" />
            </span>
            {translate('Suggest name')}
          </Button>
        </Tip>
      )}
    </div>
  );
};
export const ResourceNameGroup = ({ nameValidate, nameLabel, offering }) => (
  <Field
    name="attributes.name"
    label={nameLabel || translate('Name')}
    component={FormGroup}
    required={true}
    description={translate('This name will be visible in accounting data.')}
    validate={nameValidate || getNameFieldValidators()}
  >
    <ResourceNameField offering={offering} />
  </Field>
);
