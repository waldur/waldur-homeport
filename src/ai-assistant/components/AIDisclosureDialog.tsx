import {
  CaretDownIcon,
  CaretUpIcon,
  LockIcon,
  ShieldWarningIcon,
  SparkleIcon,
} from '@phosphor-icons/react';
import { FC, ReactNode, useState } from 'react';

import { BaseButton } from 'waldur-ui';

import { translate } from '@/i18n';

interface AIDisclosureBannerProps {
  onAcknowledge: () => void;
}

interface AccordionSectionProps {
  icon: ReactNode;
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

const AccordionSection: FC<AccordionSectionProps> = ({
  icon,
  title,
  defaultOpen = false,
  children,
}) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className="aui-disclosure-section border"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      <div
        className="flex items-center justify-between px-5 py-4 cursor-pointer"
        onClick={() => setOpen((v) => !v)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setOpen((v) => !v);
          }
        }}
      >
        <div className="flex items-center gap-3">
          <span className="text-brand">{icon}</span>
          <span className="font-medium text-sm">{title}</span>
        </div>
        {open ? (
          <CaretUpIcon size={16} weight="bold" className="text-quaternary" />
        ) : (
          <CaretDownIcon size={16} weight="bold" className="text-quaternary" />
        )}
      </div>
      {open && (
        <div className="px-5 pb-5 pt-0">
          <div className="text-quaternary leading-relaxed">{children}</div>
        </div>
      )}
    </div>
  );
};

export const AIDisclosureBanner: FC<AIDisclosureBannerProps> = ({
  onAcknowledge,
}) => {
  return (
    <div className="flex flex-col items-center grow overflow-auto py-8 px-5">
      <div className="text-center mb-8">
        <div className="mb-4">
          <SparkleIcon size={32} weight="duotone" className="text-brand" />
        </div>
        <h2 className="font-medium text-lg mb-2">
          {translate('Before you begin')}
        </h2>
        <p className="text-quaternary text-sm mb-0">
          {translate(
            'Please review the following information about the AI Assistant.',
          )}
        </p>
      </div>

      <div
        className="flex flex-col gap-3 w-full mb-8"
        style={{ maxWidth: 520 }}
      >
        <AccordionSection
          icon={<ShieldWarningIcon size={18} weight="duotone" />}
          title={translate('Experimental AI & external processing')}
          defaultOpen
        >
          <p className="mb-4">
            {translate(
              'This assistant is powered by AI and may produce inaccurate or incomplete responses. Always verify critical information before acting on it.',
            )}
          </p>
          <p className="mb-0">
            {translate(
              'Only your messages are sent to an external LLM service for processing. Your personal data is not shared. Do not share information you would not want processed by a third-party service.',
            )}
          </p>
        </AccordionSection>

        <AccordionSection
          icon={<LockIcon size={18} weight="duotone" />}
          title={translate('Privacy & data security: what not to share')}
        >
          <p className="mb-3">
            {translate(
              'For your security, never share the following types of information:',
            )}
          </p>
          <ul className="mb-0 ps-4">
            <li>{translate('SSH keys')}</li>
            <li>{translate('API tokens and secrets')}</li>
            <li>{translate('Passwords and credentials')}</li>
            <li>{translate('Private certificates')}</li>
            <li>{translate('Personal identification numbers')}</li>
            <li>{translate('Credit card or banking details')}</li>
          </ul>
        </AccordionSection>

        <AccordionSection
          icon={<SparkleIcon size={18} weight="duotone" />}
          title={translate('Safe usage & support')}
        >
          <ul className="mb-4 ps-4">
            <li>
              {translate(
                'Verify commands and configurations before executing them.',
              )}
            </li>
            <li>
              {translate(
                'Review AI suggestions critically. They may not reflect your specific environment.',
              )}
            </li>
          </ul>
          <p className="mb-0">
            {translate(
              'If you need assistance beyond what the AI can provide, please contact the helpdesk.',
            )}
          </p>
        </AccordionSection>
      </div>

      <div className="w-full" style={{ maxWidth: 520 }}>
        <BaseButton
          variant="primary"
          className="w-full py-3 font-medium text-sm"
          onClick={onAcknowledge}
          label={translate('I understand')}
        />
      </div>
    </div>
  );
};
