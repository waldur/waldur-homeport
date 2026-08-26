import { FC, ReactNode } from 'react';

interface ScopeSubtitleProps {
  label: ReactNode;
  name: ReactNode;
}

/**
 * Names the object a dialog acts on. Most dialogs are opened from a table row
 * or an action menu, where the title alone ("Change quotas") does not say which
 * of the listed objects is about to be changed.
 */
export const ScopeSubtitle: FC<ScopeSubtitleProps> = ({ label, name }) => (
  <>
    <b>{label}</b>: {name}
  </>
);
