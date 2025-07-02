import { FC } from 'react';
import { User } from 'waldur-js-client';

import { ENV } from '@waldur/core/config';
import { translate } from '@waldur/i18n';

import { DangerActionPanel } from './DangerActionPanel';

export const UserDeleteAccount: FC<{ user: User }> = ({ user }) => (
  <DangerActionPanel
    panelTitle={translate('Delete account')}
    buttonTitle={translate('Request deletion')}
    panelDescription={
      <ul className="text-gray-500 mb-7">
        <li>{translate('Permanently delete your account.')}</li>
        <li>{translate('This action cannot be undone.')}</li>
      </ul>
    }
    checkboxLabel={translate(
      'I confirm that I understand the impact and want to delete my account',
    )}
    issueSummary={translate('Account deletion')}
    sucessMessage={translate('Request for account deletion has been created.')}
    dialogTitle={translate('Request account removal for {userName}.', {
      userName: user.full_name,
    })}
    dialogSubtitle={translate(
      'Why would you want to go away? Help us become better please!',
    )}
    fallbackMessage={
      <>
        <p>
          {translate('To remove account, please send a request to {support}.', {
            support: ENV.plugins.WALDUR_CORE.SITE_EMAIL || translate('support'),
          })}
        </p>
        <p>
          {translate(
            'Please note that request should specify user name and provide a reason.',
          )}
        </p>
      </>
    }
  />
);
