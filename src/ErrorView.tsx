import {
  ArrowClockwiseIcon,
  EyeIcon,
  WarningCircleIcon,
} from '@phosphor-icons/react';
import { FC } from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import '@waldur/navigation/header/search/NoResult.scss';

import { lazyComponent } from './core/lazyComponent';
import { openModalDialog } from './modal/actions';
import { RadialBg } from './navigation/header/search/RadialBg';

const ErrorTraceDialog = lazyComponent(() =>
  import('@waldur/ErrorTraceDialog').then((module) => ({
    default: module.ErrorTraceDialog,
  })),
);

interface ErrorViewProps {
  error: any;
}

export const ErrorView: FC<ErrorViewProps> = ({ error }) => {
  const dispatch = useDispatch();
  const openErrorTraceDialog = () =>
    dispatch(openModalDialog(ErrorTraceDialog, { error } as any));

  return (
    <div className="search-error">
      <RadialBg className="background" />
      <div className="text-center d-flex flex-column align-items-center pb-10 position-relative z-index-1">
        <div className="icon-square icon-lg error-icon">
          <WarningCircleIcon weight="bold" size={24} />
        </div>

        <div>
          <h4>{translate('Something went wrong')}</h4>
          <div className="d-flex flex-column align-items-center text-tertiary fs-6">
            <p className="mb-0 mx-300px">
              {translate('An error occurred.')}
              <br />
              {translate('Try reloading or go back to the previous page')}
            </p>
          </div>
        </div>
        <div className="actions d-flex gap-4 mt-2">
          <Button variant="tertiary" onClick={openErrorTraceDialog}>
            <span className="svg-icon svg-icon-2">
              <EyeIcon weight="bold" />
            </span>
            {translate('Show error trace')}
          </Button>
          <Button variant="tertiary" onClick={() => location.reload()}>
            <span className="svg-icon svg-icon-2">
              <ArrowClockwiseIcon weight="bold" />
            </span>
            {translate('Reload')}
          </Button>
        </div>
      </div>
    </div>
  );
};
