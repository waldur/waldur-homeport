import * as React from 'react';
import * as Modal from 'react-bootstrap/lib/Modal';

import { CustomComponentInputProps, FilterOptions } from '@waldur/form/types';
import { TranslateProps, withTranslation } from '@waldur/i18n';
import ActionButton from '@waldur/table-react/ActionButton';

import { ChoicesTable } from './ChoicesTable';
import { SelectDialogFieldColumn, SelectDialogFieldChoice } from './SelectDialogField';

interface AppstoreListDialogProps extends TranslateProps {
  title: string;
  show: boolean;
  columns: SelectDialogFieldColumn[];
  choices: SelectDialogFieldChoice[];
  input: CustomComponentInputProps<SelectDialogFieldChoice>;
  filterOptions?: FilterOptions;
  onClose(): void;
  onSelect(value: SelectDialogFieldChoice): void;
}

export const AppstoreListDialog = withTranslation((props: AppstoreListDialogProps) => (
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
          className="btn btn-default"
          title={props.translate('Cancel')}
          action={() => {
            props.input.onChange(null);
            props.onClose();
          }}/>
        <ActionButton
          className="btn btn-default"
          title={props.translate('Reset')}
          action={() => {
            props.input.onChange(null);
            props.onSelect(null);
            props.onClose();
          }}/>
        <ActionButton
          className="btn btn-primary"
          title={props.translate('Select')}
          action={() => {
            props.onSelect(props.input.value);
            props.onClose();
          }}/>
      </>
    </Modal.Footer>
  </Modal>
));
