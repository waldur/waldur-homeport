import {
  CaretDownIcon,
  CaretUpIcon,
  LockIcon,
  ShieldWarningIcon,
  SparkleIcon,
} from '@phosphor-icons/react';
import { FC, ReactNode, useState } from 'react';

import { translate } from '@waldur/i18n';

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
      style={{ backgroundColor: 'var(--bs-body-bg)' }}
    >
      <div
        className="d-flex align-items-center justify-content-between px-5 py-4 cursor-pointer"
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
        <div className="d-flex align-items-center gap-3">
          <span className="text-primary">{icon}</span>
          <span className="fw-bold fs-6">{title}</span>
        </div>
        {open ? (
          <CaretUpIcon size={16} weight="bold" className="text-muted" />
        ) : (
          <CaretDownIcon size={16} weight="bold" className="text-muted" />
        )}
      </div>
      {open && (
        <div className="px-5 pb-5 pt-0">
          <div className="text-muted lh-lg">{children}</div>
        </div>
      )}
    </div>
  );
};

export const AIDisclosureBanner: FC<AIDisclosureBannerProps> = ({
  onAcknowledge,
}) => {
  return (
    <div className="d-flex flex-column align-items-center flex-grow-1 overflow-auto py-8 px-5">
      <div className="text-center mb-8">
        <div className="mb-4">
          <SparkleIcon size={32} weight="duotone" className="text-primary" />
        </div>
        <h2 className="fw-bold fs-3 mb-2">{translate('Before you begin')}</h2>
        <p className="text-muted fs-6 mb-0">
          {translate(
            'Please review the following information about the AI Assistant.',
          )}
        </p>
      </div>

      <div
        className="d-flex flex-column gap-3 w-100 mb-8"
        style={{ maxWidth: 520 }}
      >
        <AccordionSection
          icon={<ShieldWarningIcon size={18} weight="duotone" />}
          title={translate('Experimental AI & External Processing')}
          defaultOpen
        >
          <p className="mb-4">
            {translate(
              'This assistant is powered by AI and may produce inaccurate or incomplete responses. Always verify critical information before acting on it.',
            )}
          </p>
          <p className="mb-0">
            {translate(
              'Only your messages are sent to an external LLM service for processing. Your Waldur data is not shared. Do not share information you would not want processed by a third-party service.',
            )}
          </p>
        </AccordionSection>

        <AccordionSection
          icon={<LockIcon size={18} weight="duotone" />}
          title={translate('Privacy & Data Security: What Not to Share')}
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
          title={translate('Safe Usage & Support')}
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
              'If you need assistance beyond what the AI can provide, please contact your organization administrator or support team.',
            )}
          </p>
        </AccordionSection>
      </div>

      <div className="w-100" style={{ maxWidth: 520 }}>
        <button
          className="btn btn-primary w-100 py-3 fw-bold fs-6"
          onClick={onAcknowledge}
        >
          {translate('I understand')}
        </button>
      </div>
    </div>
  );
};
