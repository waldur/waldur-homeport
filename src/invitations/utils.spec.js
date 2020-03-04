import { attachInvitationUtils, invitationUtilsService } from './utils.js';
import coreModule from '../core/module';

describe('invitationUtilsService', () => {
  function initModule(module) {
    module.constant('ENV', {
      apiEndpoint: 'https://example.com/',
      plugins: {
        WALDUR_CORE: {
          AUTHENTICATION_METHODS: ['LOCAL_SIGNIN'],
        },
      },
    });
    module.service('invitationUtilsService', invitationUtilsService);
    module.run(attachInvitationUtils);
    coreModule(module);
  }

  initModule(
    angular.module('invitationUtilsModule', ['ngResource', 'ui.router']),
  );
  beforeEach(angular.mock.module('invitationUtilsModule'));

  let emailConfirmedDialogResult = {
    result: {
      then: callback => callback(true),
    },
    closed: {
      then: () => {},
    },
  };
  let invitationCanceledDialogResult = {
    result: {
      then: () => {},
    },
    closed: {
      then: callback => callback(),
    },
  };

  let token = 'token';
  beforeEach(
    angular.mock.module(function($provide) {
      $provide.factory('$auth', function() {
        return {
          isAuthenticated: jasmine
            .createSpy('isAuthenticated')
            .and.returnValue(true),
        };
      });
      $provide.factory('invitationService', function($q) {
        return {
          getInvitationToken: jasmine
            .createSpy('getInvitationToken')
            .and.returnValue(token),
          setInvitationToken: jasmine.createSpy('setInvitationToken'),
          accept: jasmine.createSpy('accept').and.returnValue($q.when([])),
          clearInvitationToken: jasmine.createSpy('clearInvitationToken'),
        };
      });
      $provide.factory('usersService', function($q) {
        return {
          mandatoryFieldsMissing: jasmine
            .createSpy('mandatoryFieldsMissing')
            .and.returnValue(false),
          getCurrentUser: jasmine
            .createSpy('getCurrentUser')
            .and.returnValue($q.when([])),
        };
      });
      $provide.factory('ncUtilsFlash', function() {
        return {
          success: jasmine.createSpy('success'),
          error: jasmine.createSpy('error'),
        };
      });
      $provide.factory('$uibModal', function() {
        return {
          open: jasmine
            .createSpy('open')
            .and.returnValue(emailConfirmedDialogResult),
        };
      });
      $provide.service('$uibModalStack', function() {});
      $provide.factory('$state', function() {
        return {
          go: jasmine.createSpy('go'),
        };
      });
    }),
  );

  let instance;
  let $auth;
  let $rootScope;
  let $uibModal;
  let usersService;
  let invitationService;
  let ncUtilsFlash;
  let $state;

  beforeEach(inject((
    _invitationUtilsService_,
    _$auth_,
    _$rootScope_,
    _$uibModal_,
    _usersService_,
    _invitationService_,
    _ncUtilsFlash_,
    _$state_,
  ) => {
    instance = _invitationUtilsService_;
    $auth = _$auth_;
    $rootScope = _$rootScope_;
    $uibModal = _$uibModal_;
    usersService = _usersService_;
    invitationService = _invitationService_;
    ncUtilsFlash = _ncUtilsFlash_;
    $state = _$state_;
  }));

  describe('onStateChanged', () => {
    it('does not call isAuthenticated on initialization', () => {
      expect($auth.isAuthenticated).not.toHaveBeenCalled();
    });

    it('calls isAuthenticated if $stateChangeSuccess is propagated', () => {
      $rootScope.$emit('$stateChangeSuccess');
      expect($auth.isAuthenticated).toHaveBeenCalled();
    });

    it('accepts invitation token and clears it out after that', () => {
      $rootScope.$emit('$stateChangeSuccess');
      $rootScope.$digest();
      expect($auth.isAuthenticated).toHaveBeenCalled();
      expect(usersService.getCurrentUser).toHaveBeenCalled();
      expect(usersService.mandatoryFieldsMissing).toHaveBeenCalled();
      expect($uibModal.open).toHaveBeenCalled();
      expect(invitationService.accept).toHaveBeenCalled();
      expect(ncUtilsFlash.success).toHaveBeenCalled();
      expect(invitationService.clearInvitationToken).toHaveBeenCalled();
    });

    it('does not call getCurrentUser if user is not Authenticated', () => {
      $auth.isAuthenticated.and.returnValue(false);
      $rootScope.$emit('$stateChangeSuccess');
      $rootScope.$digest();
      expect($auth.isAuthenticated).toHaveBeenCalled();
      expect(usersService.getCurrentUser).not.toHaveBeenCalled();
    });

    it('does not call confirmation dialog if user token does not exist', () => {
      invitationService.getInvitationToken.and.returnValue(null);
      $rootScope.$emit('$stateChangeSuccess');
      $rootScope.$digest();
      expect($auth.isAuthenticated).toHaveBeenCalled();
      expect(usersService.getCurrentUser).toHaveBeenCalled();
      expect($uibModal.open).not.toHaveBeenCalled();
    });

    it('does not call confirmation dialog if user token defined and user has not filled in all mandatory fields', () => {
      usersService.mandatoryFieldsMissing.and.returnValue(true);
      $rootScope.$emit('$stateChangeSuccess');
      $rootScope.$digest();
      expect($auth.isAuthenticated).toHaveBeenCalled();
      expect(usersService.getCurrentUser).toHaveBeenCalled();
      expect(usersService.mandatoryFieldsMissing).toHaveBeenCalled();
      expect($uibModal.open).not.toHaveBeenCalled();
    });

    it('does not call accept token in dialog has not been confirmed', () => {
      $uibModal.open.and.returnValue(invitationCanceledDialogResult);
      $rootScope.$emit('$stateChangeSuccess');
      $rootScope.$digest();
      expect($auth.isAuthenticated).toHaveBeenCalled();
      expect(usersService.getCurrentUser).toHaveBeenCalled();
      expect(usersService.mandatoryFieldsMissing).toHaveBeenCalled();
      expect($uibModal.open).toHaveBeenCalled();
      expect(invitationService.accept).not.toHaveBeenCalled();
      expect(invitationService.clearInvitationToken).toHaveBeenCalled();
      expect(ncUtilsFlash.error).toHaveBeenCalled();
    });
  });

  describe('checkAddAccept', () => {
    it('sets invitation token and redirects to registration if user is not authenticated', () => {
      $auth.isAuthenticated.and.returnValue(false);
      instance.checkAndAccept(token);
      $rootScope.$digest();
      expect($auth.isAuthenticated).toHaveBeenCalled();
      expect(invitationService.setInvitationToken).toHaveBeenCalled();
      expect(invitationService.setInvitationToken).toHaveBeenCalled();
      expect($state.go).toHaveBeenCalledWith('register');
    });

    it('clears token and redirects to profile details if token is not valid and user is logged in', () => {
      $uibModal.open.and.returnValue(invitationCanceledDialogResult);
      instance.checkAndAccept(token);
      $rootScope.$digest();
      expect($uibModal.open).toHaveBeenCalled();
      expect($auth.isAuthenticated).toHaveBeenCalled();
      expect(invitationService.clearInvitationToken).toHaveBeenCalled();
      expect(ncUtilsFlash.error).toHaveBeenCalled();
      expect($state.go).toHaveBeenCalledWith('profile.details');
    });
  });
});
