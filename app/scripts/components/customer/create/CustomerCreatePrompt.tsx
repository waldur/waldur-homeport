import * as React from 'react';
import { InjectedFormProps } from 'redux-form';

import { SubmitButton, CancelButton, FormContainer, RadioButtonIconField, RadioButtonIconChoice, FieldError } from '@waldur/form-react';
import { TranslateProps } from '@waldur/i18n';

import * as constants from './constants';
import './CustomerCreatePrompt.scss';

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
  return (
    <div className="customer-create-prompt">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="modal-header">
          <h3 className="modal-message-button__title">{translate('Please pick the profile that describes your organization.')}</h3>
        </div>
        <div className="modal-body">
          <FormContainer
            submitting={submitting}
            clearOnUnmount={false}
          >
            <RadioButtonIconField
              name={constants.FIELD_NAMES.role}
              wrapperClassName="row"
              defaultItemClassName={getColumnClassName()}
              choices={[
                RadioButtonIconChoice(constants.ROLES.customer, (
                  <div className="message-button svgfonticon svgfonticon-customer">
                    <div className="message-button__title">{translate('Customer')}</div>
                    <div className="message-button__content">
                      {translate('Become a customer of our portal. Provision IT services from the Marketplace and manage your team from one place.')}
                    </div>
                  </div>
                )),
                canRegisterExpert && RadioButtonIconChoice(constants.ROLES.expert, (
                  <div className="message-button svgfonticon svgfonticon-expert">
                    <div className="message-button__title">{translate('Expert')}</div>
                    <div className="message-button__content">
                      {translate('Register as a customer of our portal that can also offer own experts to the other customers of Waldur.')}
                    </div>
                  </div>
                )),
                canRegisterProvider && RadioButtonIconChoice(constants.ROLES.provider, (
                  <div className="message-button svgfonticon svgfonticon-provider">
                    <div className="message-button__title">{translate('Service Provider')}</div>
                    <div className="message-button__content">
                      {translate('Register as a customer of our portal and provider your cloud services through Waldur\'s Marketplace.')}
                    </div>
                  </div>
                )),
              ]}
            />
          </FormContainer>
        </div>
        <div className="modal-footer">
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
        </div>
      </form>
    </div>
  );
};
