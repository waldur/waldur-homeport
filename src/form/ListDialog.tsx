import { Modal } from 'react-bootstrap';

import { CustomComponentInputProps, FilterOptions } from '@waldur/form/types';
import { translate } from '@waldur/i18n';
import { ActionButton } from '@waldur/table/ActionButton';

import { ChoicesTable } from './ChoicesTable';
import {
  SelectDialogFieldColumn,
  SelectDialogFieldChoice,
} from './SelectDialogField';

interface ListDialogProps {
  title: string;
  show: boolean;
  columns: SelectDialogFieldColumn[];
  choices: SelectDialogFieldChoice[];
  input: CustomComponentInputProps<SelectDialogFieldChoice>;
  filterOptions?: FilterOptions;
  onClose(): void;
  onSelect(value: SelectDialogFieldChoice): void;
}

export const ListDialog = (props: ListDialogProps) => (
  <Modal show={props.show} onHide={props.onClose}>
    <Modal.Header>
      <Modal.Title>{props.title}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <ChoicesTable
        choices={props.choices}
        columns={props.columns}
        input={props.input}
        filterOptions={props.filterOptions}
      />
    </Modal.Body>
    <Modal.Footer>
      <>
        <ActionButton
          className="btn btn-secondary"
          title={translate('Cancel')}
          action={() => {
            props.input.onChange(null);
            props.onClose();
          }}
        />
        <ActionButton
          className="btn btn-secondary"
          title={translate('Reset')}
          action={() => {
            props.input.onChange(null);
            props.onSelect(null);
            props.onClose();
          }}
        />
        <ActionButton
          className="btn btn-primary"
          title={translate('Select')}
          action={() => {
            props.onSelect(props.input.value);
            props.onClose();
          }}
        />
      </>
    </Modal.Footer>
  </Modal>
);
