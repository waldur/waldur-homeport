import * as React from 'react';

import { FormField } from './types';

interface FileUploadFieldProps extends FormField {
  accept?: string;
  buttonLabel: string;
}

export class FileUploadField extends React.Component<FileUploadFieldProps> {
  private fileInput: HTMLInputElement;

  state = {
    fileName: undefined,
  };

  openFileDialog = () => {
    this.fileInput.click();
  }

  handleFile = event => {
    const files = event.target.files;
    if (files.length === 1) {
      const file = files[0];
      if (!this.props.accept || file.type === this.props.accept) {
        this.setState({fileName: file.name});
        this.props.input.onChange(file);
        return;
      }
    }
    this.setState({fileName: undefined});
    this.props.input.onChange(null);
  }

  render() {
    return (
      <span>
        {this.state.fileName || 'None'}
        <a className="btn btn-sm btn-primary m-l-sm"
          onClick={this.openFileDialog} >
          <i className="fa fa-upload"/>
          {' '}
          {this.props.buttonLabel}
        </a>
        <input
          type="file"
          style={{ display: 'none' }}
          ref={input => this.fileInput = input}
          accept={this.props.accept}
          onChange={this.handleFile}
        />
      </span>
    );
  }
}
