import { CookieIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { Switch } from 'waldur-ui';

import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';

import './CookieSettingsDialog.css';

interface CookieSettingsDialogProps {
  close?: () => void;
}

interface CookieCategoryProps {
  title: string;
  description: string;
  value: boolean;
  disabled?: boolean;
}

const CookieCategory: FC<CookieCategoryProps> = ({
  title,
  description,
  value,
  disabled,
}) => (
  <div className="cookie-settings-category border-b-[1px] border-b-secondary py-4">
    <div className="flex items-start justify-between gap-3">
      <div>
        <div className="font-medium">{title}</div>
        <div className="text-quaternary text-xs">{description}</div>
      </div>
      <Switch
        aria-label={title}
        checked={value}
        disabled={disabled}
        className="mb-0 shrink-0"
      />
    </div>
  </div>
);

export const CookieSettingsDialog: FC<CookieSettingsDialogProps> = ({
  close,
}) => (
  <ModalDialog
    title={translate('Cookie settings')}
    iconNode={<CookieIcon weight="bold" />}
    iconColor="warning"
    className="cookie-settings-dialog"
    bodyClassName="pt-0 pb-2"
    footer={
      <div className="flex items-center justify-between w-full gap-3">
        <Link
          state="about.privacy"
          label={translate('View Privacy Policy')}
          className="text-brand"
          onClick={close}
        />
        <div className="flex gap-3">
          <CloseDialogButton className="min-w-[100px]" onClick={close} />
          <CloseDialogButton
            className="min-w-[100px]"
            label={translate('Save')}
            variant="primary"
            onClick={close}
          />
        </div>
      </div>
    }
  >
    <CookieCategory
      title={translate('Essential cookies')}
      description={translate(
        'These cookies are necessary for the website to function properly and cannot be disabled.',
      )}
      value
      disabled
    />
    <CookieCategory
      title={translate('Analytics cookies')}
      description={translate(
        'Help us understand how visitors interact with the website. (Currently unavailable)',
      )}
      value={false}
      disabled
    />
    <CookieCategory
      title={translate('Marketing cookies')}
      description={translate(
        'Used to deliver personalized ads and track performance. (Currently unavailable)',
      )}
      value={false}
      disabled
    />
    <CookieCategory
      title={translate('Functional cookies')}
      description={translate(
        'Enhance user experience by remembering preferences. (Currently unavailable)',
      )}
      value={false}
      disabled
    />
  </ModalDialog>
);
