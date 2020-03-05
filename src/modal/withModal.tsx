import * as React from 'react';

export const withModal = Modal => Component => {
  return class WithModal extends React.Component {
    state = {
      isOpen: false,
      modalProps: {},
    };

    handleOpenModal(onSuccess) {
      this.setState({
        isOpen: true,
        onSuccess,
      });
    }

    handleCloseModal() {
      this.setState({ isOpen: false });
    }

    setModalProps(props) {
      this.setState({
        modalProps: props,
      });
    }

    render() {
      return (
        <>
          <Component
            {...this.props}
            {...this.state}
            setModalProps={props => this.setModalProps(props)}
            openModal={onSuccess => this.handleOpenModal(onSuccess)}
          />
          {this.state.isOpen && (
            <Modal {...this.state} closeModal={() => this.handleCloseModal()} />
          )}
        </>
      );
    }
  };
};
