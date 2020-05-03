import * as React from 'react';
import Button from 'react-bootstrap/lib/Button';

export const SubmitButton = ({ submitting, label }) => (
  <Button type="submit" bsStyle="primary" block disabled={submitting}>
    {submitting && (
      <>
        <i className="fa fa-spinner fa-spin m-r-xs" />{' '}
      </>
    )}
    {label}
  </Button>
);
