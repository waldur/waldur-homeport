import { Tip } from '@waldur/core/Tooltip';

export const ActionButton = ({
  title,
  iconClass,
  action,
}: {
  title: string;
  iconClass: string;
  action?(): void;
}) => (
  <Tip label={title} id="action-button">
    <div
      className="btn btn-bg-light btn-icon btn-active-color-primary"
      onClick={() => action()}
    >
      <i className={`fa ${iconClass}`} />
    </div>
  </Tip>
);
