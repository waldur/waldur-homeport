import {
  ArrowClockwiseIcon,
  EyeIcon,
  WarningCircleIcon,
} from '@phosphor-icons/react';
import { FC } from 'react';
import { translate } from 'waldur-i18n-runtime';

import { BaseButton } from '../Button';
import { RadialBackground, useModal } from '../Dialog';
import { IconSquare } from '../IconSquare';

import { ErrorTraceDialog } from './ErrorTraceDialog';
import {
  STATE_BACKGROUND_CLASSNAME,
  STATE_ICON_CLASSNAME,
  STATE_ROOT_CLASSNAME,
  STATE_TITLE_CLASSNAME,
} from './styles';

interface ErrorViewProps {
  error: any;
}

export const ErrorView: FC<ErrorViewProps> = ({ error }) => {
  const { openDialog } = useModal();
  const openErrorTraceDialog = () =>
    openDialog(ErrorTraceDialog, { error } as any);

  return (
    <div data-slot="error-view" className={STATE_ROOT_CLASSNAME}>
      <RadialBackground className={STATE_BACKGROUND_CLASSNAME} />
      <div className="text-center flex flex-col items-center pb-8 relative z-1">
        <IconSquare size="lg" className={STATE_ICON_CLASSNAME}>
          <WarningCircleIcon weight="bold" size={24} />
        </IconSquare>

        <div>
          <h4 className={STATE_TITLE_CLASSNAME}>
            {translate('Something went wrong')}
          </h4>
          <div className="flex flex-col items-center text-quaternary text-sm">
            <p className="mb-0">
              {translate('An error occurred.')}
              <br />
              {translate('Try reloading or go back to the previous page')}
            </p>
          </div>
        </div>
        <div className="mt-1.5 flex gap-3">
          <BaseButton
            variant="tertiary"
            onClick={openErrorTraceDialog}
            label={translate('Show error trace')}
            iconNode={<EyeIcon weight="bold" />}
            size="lg"
          />
          <BaseButton
            variant="tertiary"
            onClick={() => location.reload()}
            label={translate('Reload')}
            iconNode={<ArrowClockwiseIcon weight="bold" />}
            size="lg"
          />
        </div>
      </div>
    </div>
  );
};
