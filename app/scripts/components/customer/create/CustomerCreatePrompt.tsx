import * as React from 'react';
import { InjectedFormProps } from 'redux-form';
import { Field } from 'redux-form';

import { SubmitButton, CancelButton, FieldError } from '@waldur/form-react';
import { RadioButtonChoice, RadioButtonField } from '@waldur/form-react/RadioButtonField';
import { TranslateProps } from '@waldur/i18n';
import { ModalDialog } from '@waldur/modal/ModalDialog';

import * as constants from './constants';
import './CustomerCreatePrompt.scss';
import { MessageButton } from './MessageButton';

interface CustomerCreatePromptProps extends TranslateProps, InjectedFormProps {
  canRegisterProvider: boolean;
  canRegisterExpert: boolean;
  closeModal(): void;
  onSubmit(data: { [key: string]: string }): void;
}

export const CustomerCreatePrompt = (props: CustomerCreatePromptProps) => {
  const {
    translate,
    canRegisterProvider,
    canRegisterExpert,
    handleSubmit,
    submitting,
    error,
    closeModal,
    onSubmit,
  } = props;
  const getColumnClassName = () => {
    let counter = 1;

    if (canRegisterProvider) {
      counter++;
    }

    if (canRegisterExpert) {
      counter++;
    }

    switch (counter) {
      case 1:
        return 'col-12';
      case 2:
        return 'col-sm-6';
      case 3:
        return 'col-sm-4';
    }
  };
  const renderRadioButtons = field => (
    <RadioButtonField
      {...field}
      required={true}
      name={constants.FIELD_NAMES.role}
      wrapperClassName="row"
      defaultItemClassName={getColumnClassName()}
      isHiddenInput={true}
      choices={[
        new RadioButtonChoice(constants.ROLES.customer, (
          <MessageButton
            iconClass="svgfonticon svgfonticon-customer"
            title={translate('Customer')}
          >
            {translate('Become a customer of our portal. Provision IT services from the Marketplace and manage your team from one place.')}
          </MessageButton>
        )),
        canRegisterExpert && new RadioButtonChoice(constants.ROLES.expert, (
          <MessageButton
            iconClass="svgfonticon svgfonticon svgfonticon-expert"
            title={translate('Expert')}
          >
            {translate('Register as a customer of our portal that can also offer own experts to the other customers of Waldur.')}
          </MessageButton>
        )),
        canRegisterProvider && new RadioButtonChoice(constants.ROLES.provider, (
          <MessageButton
            iconClass="svgfonticon svgfonticon-provider"
            title={translate('Service Provider')}
          >
            {translate('Register as a customer of our portal and provider your cloud services through Waldur\'s Marketplace.')}
          </MessageButton>
        )),
      ]}
    />
  );
  return (
    <div className="customer-create-prompt">
      <form onSubmit={handleSubmit(onSubmit)}>
        <ModalDialog
          title={translate('Please pick the profile that describes your organization.')}
          footer={<div>
            <div className="content-center">
              <FieldError error={error} />
            </div>
            <SubmitButton
              submitting={submitting}
              label={translate('Yes, I would')}
            />
            <CancelButton
              label={translate('No, I will do it later')}
              onClick={closeModal}
            />
          </div>}
        >
          <Field
            name={constants.FIELD_NAMES.role}
            component={renderRadioButtons}
          />
        </ModalDialog>
      </form>
    </div>
  );
};
