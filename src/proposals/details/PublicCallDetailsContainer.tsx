import { useCurrentStateAndParams } from '@uirouter/react';
import { FunctionComponent } from 'react';
import { useAsyncFn, useEffectOnce } from 'react-use';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { InvalidRoutePage } from '@waldur/error/InvalidRoutePage';
import { translate } from '@waldur/i18n';
import { useFullPage } from '@waldur/navigation/context';
import { useTitle } from '@waldur/navigation/title';

import { getPublicCall } from '../api';

import { PublicCallDetails } from './PublicCallDetails';

export const PublicCallDetailsContainer: FunctionComponent = () => {
  useFullPage();

  const {
    params: { uuid },
  } = useCurrentStateAndParams();

  const [{ loading, error, value }, refreshCall] = useAsyncFn(
    () => getPublicCall(uuid),
    [uuid],
  );

  useEffectOnce(() => {
    refreshCall();
  });

  useTitle(value ? value.name : translate('Call details'));

  return loading ? (
    <LoadingSpinner />
  ) : error ? (
    <h3>{translate('Unable to load call details.')}</h3>
  ) : value ? (
    <>
      <PublicCallDetails call={value} refreshCall={refreshCall} />
    </>
  ) : (
    <InvalidRoutePage />
  );
};