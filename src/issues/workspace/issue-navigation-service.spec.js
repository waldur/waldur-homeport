import IssueNavigationService from './issue-navigation-service';

describe('IssueNavigationService', () => {
  let $scope;
  let deferred;
  let $state;
  let service;
  let isOwnerOrStaff;

  const hasLink = (items, link) =>
    items.filter(item => item.link === link).length >= 1;

  beforeEach(inject((_$rootScope_, _$q_) => {
    $scope = _$rootScope_.$new();
    deferred = _$q_.defer();
    const usersService = {
      getCurrentUser: () => deferred.promise,
    };
    const currentStateService = {
      getOwnerOrStaff: () => isOwnerOrStaff,
    };
    const features = {
      isVisible: () => true,
    };
    $state = jasmine.createSpyObj('$state', ['go']);
    service = new IssueNavigationService(
      $state,
      usersService,
      currentStateService,
      features,
    );
    isOwnerOrStaff = false;
  }));

  it('redirects to helpdesk if user is staff', () => {
    deferred.resolve({ is_staff: true });
    service.gotoDashboard();
    $scope.$apply();
    expect($state.go).toHaveBeenCalledWith('support.helpdesk');
  });

  it('redirects to helpdesk if user is global support', () => {
    deferred.resolve({ is_support: true });
    service.gotoDashboard();
    $scope.$apply();
    expect($state.go).toHaveBeenCalledWith('support.helpdesk');
  });

  it('redirects to dashboard if user is not support or staff', () => {
    deferred.resolve({});
    service.gotoDashboard();
    $scope.$apply();
    expect($state.go).toHaveBeenCalledWith('support.dashboard');
  });

  it('returns sidebar with helpdesk link if user is global support', () => {
    deferred.resolve({ is_support: true });
    let sidebar;
    service.getSidebarItems().then(items => (sidebar = items));
    $scope.$apply();
    expect(hasLink(sidebar, 'support.helpdesk')).toBe(true);
  });

  it('returns sidebar with dashboard link if user is staff', () => {
    isOwnerOrStaff = true;
    deferred.resolve({ is_staff: true });
    let sidebar;
    service.getSidebarItems().then(items => (sidebar = items));
    $scope.$apply();
    expect(hasLink(sidebar, 'support.dashboard')).toBe(true);
  });

  it('returns sidebar with dashboard and helpdesk link if user is staff and support', () => {
    isOwnerOrStaff = true;
    deferred.resolve({ is_staff: true, is_support: true });
    let sidebar;
    service.getSidebarItems().then(items => (sidebar = items));
    $scope.$apply();
    expect(hasLink(sidebar, 'support.helpdesk')).toBe(true);
    expect(hasLink(sidebar, 'support.dashboard')).toBe(true);
  });
});
