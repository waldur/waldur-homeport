import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';
import { Field } from 'redux-form';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';

const TermsOfServiceDialog = lazyComponent(
  () => import('./TermsOfServiceDialog'),
  'TermsOfServiceDialog',
);

interface TermsOfServiceProps {
  name: string;
  offering_terms_of_service?: string;
}

export const TermsOfService: FunctionComponent<TermsOfServiceProps> = (
  props,
) => {
  const dispatch = useDispatch();
  const onClick = (e) => {
    e.preventDefault();
    dispatch(
      openModalDialog(TermsOfServiceDialog, {
        resolve: { content: props.offering_terms_of_service },
        size: 'lg',
      }),
    );
  };

  return (
    <Field
      name={props.name}
      component={AwesomeCheckboxField}
      label={
        <a onClick={onClick}>
          <i className="fa fa-external-link" /> {translate('Terms of Service')}
        </a>
      }
      marginRight={false}
    />
  );
};
