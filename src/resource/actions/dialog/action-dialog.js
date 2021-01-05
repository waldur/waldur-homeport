import angular from 'angular';
import Axios from 'axios';
import Qs from 'qs';

import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { $injector } from '@waldur/ng';
import { router } from '@waldur/router';
import { showErrorResponse } from '@waldur/store/notify';
import store from '@waldur/store/store';

import { getSelectList, formatChoices } from '../action-resource-loader';
import { handleActionSuccess } from '../action-utils-service';
import { defaultFieldOptions } from '../constants';

import template from './action-dialog.html';

class ActionDialogController {
  $onInit() {
    if (!this.resolve) {
      return;
    }
    this.errors = {};
    this.form = {};
    this.loading = true;
    let promise;
    if (this.resolve.action.init) {
      promise = this.resolve.action.init(
        this.resolve.resource,
        this.form,
        this.resolve.action,
      );
    } else if (this.resolve.action.fields) {
      promise = getSelectList(this.resolve.action.fields);
    } else {
      promise = Promise.resolve(true);
    }
    promise
      .then(() => {
        angular.forEach(this.resolve.action.fields, (field, name) => {
          if (field.init) {
            field.init(
              field,
              this.resolve.resource,
              this.form,
              this.resolve.action,
            );
          }
          if (field.default_value) {
            this.form[name] = field.default_value;
          }
          if (
            !field.init &&
            (field.resource_default_value ||
              this.resolve.action.method === 'PUT')
          ) {
            this.form[name] = angular.copy(this.resolve.resource[name]);
          }
          if (field.modelParser) {
            this.form[name] = field.modelParser(field, this.form[name]);
          }
          if (field.type === 'multiselect' && !this.resolve.action.init) {
            this.form[name] = formatChoices(field, this.form[name]);
          }
          if (this.resolve.action.name === 'edit') {
            this.form[name] = this.resolve.resource[name];
            if (field.type === 'datetime' && this.resolve.resource[name]) {
              this.form[name] = new Date(this.resolve.resource[name]);
            }
          }
          if (defaultFieldOptions[field.type]) {
            field.options = defaultFieldOptions[field.type];
          }
        });
        if (this.resolve.action.order) {
          this.fields = this.resolve.action.order.reduce((result, name) => {
            result[name] = this.resolve.action.fields[name];
            return result;
          }, {});
        } else {
          this.fields = this.resolve.action.fields;
        }
      })
      .finally(() => {
        this.loading = false;
        // Trigger digest for async/await
        $injector.get('$rootScope').$applyAsync();
      });
  }
  get dialogTitle() {
    if (this.resolve.action.getDialogTitle) {
      return this.resolve.action.getDialogTitle(this.resolve.resource);
    } else if (this.resolve.action.dialogTitle) {
      return this.resolve.action.dialogTitle;
    } else {
      return this.resolve.action.title;
    }
  }
  submitActive() {
    if (this.ActionForm.$invalid) {
      return false;
    }
    if (this.submitting) {
      return false;
    }
    return (
      this.ActionForm.$dirty ||
      this.resolve.action.method === 'DELETE' ||
      !this.resolve.action.fields
    );
  }
  submitForm() {
    if (this.ActionForm.$invalid) {
      return Promise.reject();
    }
    const fields = this.resolve.action.fields;
    if (!this.resolve.action.url) {
      this.resolve.action.url =
        this.resolve.resource.url + this.resolve.action.name + '/';
    }
    let form = {};
    if (this.resolve.action.serializer) {
      form = this.resolve.action.serializer(this.form);
    } else {
      for (const name in fields) {
        if (this.form[name] !== null) {
          const field = fields[name];
          const serializer = field.serializer || angular.identity;
          form[name] = serializer(this.form[name], field);
        }
      }
    }

    let promise;
    let url;
    if (this.resolve.action.method === 'DELETE') {
      url = this.resolve.action.url + '?' + Qs.stringify(this.form);
      promise = Axios.delete(url);
    } else if (this.resolve.action.method === 'PUT') {
      url = this.resolve.resource.url;
      promise = Axios.put(url, form);
    } else {
      promise = Axios.post(this.resolve.action.url, form);
    }
    this.submitting = true;

    return promise.then(
      (response) => {
        this.errors = {};
        handleActionSuccess(this.resolve.action);

        if (response.status === 201 && this.resolve.action.followRedirect) {
          const resource = response.data;
          return router.stateService.go('resource-details', {
            resource_type: resource.resource_type,
            uuid: resource.uuid,
          });
        }

        this.resolve.controller.reInitResource(this.resolve.resource);
        this.close();
      },
      (response) => {
        this.submitting = false;
        this.errors = response?.data;
        store.dispatch(
          showErrorResponse(response, translate('Unable to perform action')),
        );
      },
    );
  }
  close() {
    store.dispatch(closeModalDialog());
  }
  getConfirmationMessage() {
    return translate('You are about to delete:');
  }
  getSubmitMessage() {
    return translate('Submit');
  }
  getCancelMessage() {
    return translate('Cancel');
  }
}

export default {
  template: template,
  controller: ActionDialogController,
  bindings: {
    resolve: '<',
  },
};
