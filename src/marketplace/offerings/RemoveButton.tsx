import { withTranslation, TranslateProps } from '@waldur/i18n';

interface RemoveButtonProps extends TranslateProps {
  onClick(): void;
  disabled?: boolean;
}

export const RemoveButton = withTranslation((props: RemoveButtonProps) => (
  <button
    type="button"
    className="close"
    disabled={props.disabled}
    aria-label={props.translate('Remove')}
    onClick={props.onClick}
  >
    <span aria-hidden="true">&times;</span>
  </button>
));
