import { FunctionComponent } from 'react';
import { ToggleButton, ToggleButtonGroup } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

export const AnswerGroup: FunctionComponent<{
  answers;
  question;
  setAnswers;
}> = ({ answers, question, setAnswers }) => (
  <ToggleButtonGroup
    value={
      { true: 'true', false: 'false', null: 'null' }[answers[question.uuid]]
    }
    onChange={(value) =>
      setAnswers({
        ...answers,
        [question.uuid]: { true: true, false: false, null: null }[value],
      })
    }
    type="radio"
    name={`checklist-${question.uuid}`}
    defaultValue="null"
  >
    <ToggleButton id="true" value="true">
      {translate('Yes')}
    </ToggleButton>
    <ToggleButton id="false" value="false">
      {translate('No')}
    </ToggleButton>
    <ToggleButton id="null" value="null">
      ?
    </ToggleButton>
  </ToggleButtonGroup>
);
