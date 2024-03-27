import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { ExternalLink } from '@waldur/core/ExternalLink';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { openModalDialog } from '@waldur/modal/actions';

const TermsOfServiceDialog = lazyComponent(
  () => import('@waldur/marketplace/orders/TermsOfServiceDialog'),
  'TermsOfServiceDialog',
);

interface ProviderTermsOfServiceProps {
  label: string;
  termsOfService?: any;
  termsOfServiceLink?: any;
}

export const ProviderTermsOfService: FunctionComponent<
  ProviderTermsOfServiceProps
> = (props) => {
  const dispatch = useDispatch();
  const onClick = (e) => {
    e.preventDefault();
    dispatch(
      openModalDialog(TermsOfServiceDialog, {
        resolve: { content: props.termsOfService },
        size: 'lg',
      }),
    );
  };

  return props.termsOfServiceLink ? (
    <ExternalLink url={props.termsOfServiceLink} label={props.label} iconless />
  ) : (
    <button className="text-anchor" type="button" onClick={onClick}>
      {props.label}
    </button>
  );
};
