import { Tip } from '@waldur/core/Tooltip';

export const ActionButton = ({
  title,
  disabled,
  tooltip,
  iconClass,
  action,
}: {
  title: string;
  disabled?: boolean;
  tooltip?: string;
  iconClass: string;
  action?(): void;
}) => (
  <Tip label={[title, tooltip].filter(Boolean).join(' | ')} id="action-button">
    <button
      className="btn btn-bg-light btn-icon btn-active-color-primary"
      onClick={() => action()}
      disabled={disabled}
    >
      <i className={`fa ${iconClass}`} />
    </button>
  </Tip>
);
