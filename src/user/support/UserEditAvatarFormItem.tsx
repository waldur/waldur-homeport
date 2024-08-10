import { UploadSimple } from '@phosphor-icons/react';
import { useEffect, useMemo } from 'react';
import { Button } from 'react-bootstrap';
import { connect, useDispatch } from 'react-redux';
import { Field, reduxForm } from 'redux-form';

import FormTable from '@waldur/form/FormTable';
import { WideImageField } from '@waldur/form/WideImageField';
import { translate } from '@waldur/i18n';
import { getItemAbbreviation } from '@waldur/navigation/workspace/context-selector/utils';
import { UserDetails } from '@waldur/workspace/types';

interface OwnProps {
  user: UserDetails;
  isSelf: boolean;
  callback(formData, dispatch): Promise<any>;
}

export const UserEditAvatarFormItem = connect<{}, {}, OwnProps>(
  (_, ownProps) => ({
    initialValues: { image: ownProps.user.image },
  }),
)(
  reduxForm<{ image }, OwnProps>({
    form: 'UserAvatarForm',
  })((props) => {
    const abbreviation = useMemo(
      () => getItemAbbreviation(props.user, 'full_name'),
      [props.user],
    );

    const dispatch = useDispatch<any>();
    useEffect(() => {
      // Can not use enableReinitialize on reduxForm because of infinite render loop issue
      dispatch(props.change('image', props.user.image));
    }, [dispatch, props.user]);

    return (
      <FormTable.Item
        label={translate('Avatar')}
        description={
          props.isSelf
            ? translate('Upload an image to personalize your account profile')
            : translate(
                "Upload an image to personalize the user's account profile",
              )
        }
        value={
          <form onSubmit={props.handleSubmit(props.callback)}>
            <Field
              name="image"
              component={(fieldProps) => (
                <WideImageField
                  alt={abbreviation}
                  initialValue={props.user.image}
                  max={2 * 1024 * 1024} // 2MB
                  size={65}
                  extraActions={({ isChanged, isTooLarge }) =>
                    isChanged || props.submitting ? (
                      <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        className="btn-icon-right"
                        disabled={props.submitting || isTooLarge}
                      >
                        {translate('Save')}
                        <span className="svg-icon svg-icon-5">
                          <UploadSimple />
                        </span>
                      </Button>
                    ) : null
                  }
                  {...fieldProps}
                />
              )}
            />
          </form>
        }
      />
    );
  }),
);
