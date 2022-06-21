import { translate } from '@waldur/i18n';

interface RemoveButtonProps {
  onClick(): void;
  disabled?: boolean;
}

export const RemoveButton = (props: RemoveButtonProps) => (
  <button
    type="button"
    className="close"
    disabled={props.disabled}
    aria-label={translate('Remove')}
    onClick={props.onClick}
  >
    <span aria-hidden="true">&times;</span>
  </button>
);
