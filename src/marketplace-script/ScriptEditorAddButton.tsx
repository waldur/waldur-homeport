import { Button } from 'react-bootstrap';

interface ScriptEditorAddButtonProps {
  onClick(): void;
}

export const ScriptEditorAddButton = (props: ScriptEditorAddButtonProps) => (
  <Button variant="dark" size="lg" className="btn-icon" onClick={props.onClick}>
    <i className="fa fa-plus fs-4" />
  </Button>
);
