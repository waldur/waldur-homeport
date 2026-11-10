import { FC, ReactNode } from 'react';
import { translate } from 'waldur-i18n-runtime';

interface CoiDeclarationProps {
  /** The call's or the step's own wording; empty for the platform's. */
  text?: string | null;
  /** The platform's standard declaration, worded for where it is asked. */
  fallback: ReactNode;
}

/**
 * The conflict-of-interest declaration an evaluator confirms: the wording
 * the call team gave the step or the call, else the platform's standard one.
 * What is confirmed is kept with the confirmation as worded here.
 */
export const CoiDeclaration: FC<CoiDeclarationProps> = ({ text, fallback }) =>
  text?.trim() ? (
    <div data-testid="coi-declaration">
      <div className="text-quaternary text-xs mb-1">
        {translate('By confirming you declare:')}
      </div>
      <blockquote className="border-l border-l-secondary border-3 ps-2.5 mb-0 whitespace-pre-wrap">
        {text}
      </blockquote>
    </div>
  ) : (
    <>{fallback}</>
  );
