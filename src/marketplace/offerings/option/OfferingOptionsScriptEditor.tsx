import { FC } from 'react';
import { Button, Form } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { formValueSelector, change } from 'redux-form';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { ScriptEditorAddButton } from '@waldur/marketplace-script/ScriptEditorAddButton';
import { FORM_ID } from '@waldur/marketplace/offerings/store/constants';
import { closeModalDialog, openModalDialog } from '@waldur/modal/actions';

const OptionFormDialog = lazyComponent(
  () => import('./OptionFormDialog'),
  'OptionFormDialog',
);

const openOptionFormDialog = (
  onSubmit: (data) => void,
  initialValues?,
  onRemove?: () => void,
  readOnly?: boolean,
) =>
  openModalDialog(OptionFormDialog, {
    onSubmit,
    initialValues,
    onRemove,
    readOnly,
  });

const OptionItem = ({ optionName, dispatch, onRemove, readOnly }) => {
  const option = useSelector((state) =>
    formValueSelector(FORM_ID)(state, optionName),
  );
  return (
    <div>
      <div className="d-flex flex-wrap align-items-center">
        <span className="flex-grow-1">{option.name || '-'}</span>
        <span className="flex-grow-1">{option.label || '-'}</span>
        <div className="flex-grow-1">
          <Button
            variant="text"
            className="btn-active-text-primary"
            size="sm"
            onClick={() =>
              dispatch(
                openOptionFormDialog(
                  (data) => {
                    dispatch(change(FORM_ID, optionName, data));
                    dispatch(closeModalDialog());
                  },
                  option,
                  onRemove,
                  readOnly,
                ),
              )
            }
          >
            {translate('Edit')}
          </Button>
        </div>
      </div>
      <div className="d-flex flex-wrap align-items-center">
        <span className="flex-grow-1">{option.type.label}</span>
        {option.min && (
          <span className="flex-grow-1">
            {translate('Min value')}: {option.min}
          </span>
        )}
        {option.max && (
          <span className="flex-grow-1">
            {translate('Max value')}: {option.max}
          </span>
        )}
        {option.default && (
          <span className="flex-grow-1">
            {translate('Default')}: {option.default}
          </span>
        )}
        {option.choices && (
          <span className="flex-grow-1">
            {translate('Choices')}: {option.choices}
          </span>
        )}
      </div>
      <p>{option.help_text}</p>
    </div>
  );
};

export const OfferingOptionsScriptEditor: FC<any> = (props) => {
  const dispatch = useDispatch();

  return (
    <Form.Group>
      <div className="d-flex justify-content-between align-items-center border-bottom p-2">
        <div>
          <strong>{translate('User input variables')}</strong>
          <Tip
            id="form-field-tooltip"
            label={translate(
              'If you want user to provide additional details when ordering, please configure input form for the user below',
            )}
            className="ms-2"
          >
            <i className="fa fa-question-circle" />
          </Tip>
        </div>
        <ScriptEditorAddButton
          onClick={() =>
            dispatch(
              openOptionFormDialog((data) => {
                props.fields.push(data);
                dispatch(closeModalDialog());
              }),
            )
          }
        />
      </div>
      <table className="table table-sm table-hover">
        <tbody>
          {props.fields.length ? (
            props.fields.map((option, index) => (
              <tr key={index}>
                <td>
                  <OptionItem
                    optionName={option}
                    dispatch={dispatch}
                    onRemove={() => {
                      props.fields.remove(index);
                      dispatch(closeModalDialog());
                    }}
                    readOnly={props.readOnly}
                  />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="text-center text-muted">
                {translate('No variable defined')}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </Form.Group>
  );
};
