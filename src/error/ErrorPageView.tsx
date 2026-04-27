import { FC, PropsWithChildren, ReactNode } from 'react';

import { SubmitButton } from '@/form';
import { translate } from '@/i18n';

import { goBack } from './utils';

import './ErrorPageView.scss';

interface ErrorPageViewProps {
  code: string;
  altTitle?: ReactNode;
  altDescription?: ReactNode;
  hideActions?: boolean;
}

const ERROR_TEXT = {
  '403': {
    title: null,
    description: translate('Oops... Access to this page is denied.'),
  },
  '404': { title: null, description: translate('Oops... No page found.') },
  '500': {
    title: translate('Server error'),
    description: translate(
      'There was an error on the server. Please wait, we will fix it soon.',
    ),
  },
  '503': {
    title: translate('Service not available'),
    description: translate(
      'We apologize for the inconvenience. Try reloading the page.',
    ),
  },
};

export const ErrorPageView: FC<PropsWithChildren<ErrorPageViewProps>> = (
  props,
) => {
  const title = props.altTitle || ERROR_TEXT[props.code]?.title;
  const description =
    props.altDescription ||
    ERROR_TEXT[props.code]?.description ||
    translate('Something went wrong.');

  return (
    <div className="error-view text-center">
      <h1>{props.code}</h1>
      {title ? <h2>{title}</h2> : null}
      <p>{description}</p>
      {!props.hideActions && (
        <SubmitButton submitting={false} onClick={goBack} type="button">
          {translate('Home')}
        </SubmitButton>
      )}
      {props.children}
    </div>
  );
};
