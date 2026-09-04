import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { FallbackRender } from '@sentry/react';

import { SubmitButton } from '@/form/SubmitButton';
import { translate } from '@/i18n';
import Illustration from '@/images/table-placeholders/undraw_fixing_bugs_w7gi.svg';
import { ImageTablePlaceholder } from '@/table/ImageTablePlaceholder';

export const ErrorMessage: FallbackRender = (props) => (
  <div data-testid="error-boundary-message">
    <ImageTablePlaceholder
      illustration={<Illustration />}
      title={translate('An error has occurred.')}
      description={(props.error as Error).message}
      action={
        <SubmitButton
          submitting={false}
          type="button"
          onClick={() => location.reload()}
          variant="success"
          label={translate('Reload')}
          iconNode={<ArrowsClockwiseIcon weight="bold" />}
          iconOnLeft
        />
      }
    />

    <pre className="mt-3">
      {props.componentStack || (props.error as Error).stack}
    </pre>
  </div>
);
