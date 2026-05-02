import { FunctionComponent } from 'react';

import { ExternalLink } from '@/core/ExternalLink';
import { lazyComponent } from '@/core/lazyComponent';
import { useModal } from '@/modal/actions';

const TermsOfServiceDialog = lazyComponent(() =>
  import('@/marketplace/orders/TermsOfServiceDialog').then((module) => ({
    default: module.TermsOfServiceDialog,
  })),
);

interface ProviderTermsOfServiceProps {
  label: string;
  termsOfService?: any;
  termsOfServiceLink?: any;
}

export const ProviderTermsOfService: FunctionComponent<
  ProviderTermsOfServiceProps
> = (props) => {
  const { openDialog } = useModal();
  const onClick = (e) => {
    e.preventDefault();
    openDialog(TermsOfServiceDialog, {
      resolve: { content: props.termsOfService },
      size: 'lg',
    });
  };

  return props.termsOfServiceLink ? (
    <ExternalLink url={props.termsOfServiceLink} label={props.label} iconless />
  ) : (
    <button className="text-anchor" type="button" onClick={onClick}>
      {props.label}
    </button>
  );
};
