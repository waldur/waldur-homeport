import { CookieIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { AwesomeCheckbox } from '@/core/AwesomeCheckbox';
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
  <div className="cookie-settings-category border-bottom py-4">
    <div className="d-flex align-items-start justify-content-between gap-3">
      <div>
        <div className="fw-bold">{title}</div>
        <div className="text-muted fs-7">{description}</div>
      </div>
      <AwesomeCheckbox
        value={value}
        disabled={disabled}
        className="mb-0 flex-shrink-0"
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
      <div className="d-flex align-items-center justify-content-between w-100 gap-3">
        <Link
          state="about.privacy"
          label={translate('View Privacy Policy')}
          className="text-primary fw-semibold"
          onClick={close}
        />
        <div className="d-flex gap-3">
          <CloseDialogButton className="min-w-100px" onClick={close} />
          <CloseDialogButton
            className="min-w-100px"
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
