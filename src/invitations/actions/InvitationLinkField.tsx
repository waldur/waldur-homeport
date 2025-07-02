import { Form } from 'react-bootstrap';

import { CopyToClipboardButton } from '@waldur/core/CopyToClipboardButton';
import { translate } from '@waldur/i18n';

import { getGroupInvitationLink } from '../utils';

export const InvitationLinkField = ({ invitation }) => {
  const link = invitation ? getGroupInvitationLink(invitation) : '';
  return (
    <Form.Group>
      <Form.Label>{translate('Invitation link')}</Form.Label>
      <div className="d-flex gap-2">
        <Form.Control
          value={link}
          placeholder={translate('e.g.') + ' https://'}
          readOnly
          className="form-control-solid"
        />

        <CopyToClipboardButton
          value={link}
          size={20}
          buttonClassName="btn btn-active-secondary btn-icon"
        />
      </div>
    </Form.Group>
  );
};
