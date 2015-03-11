module.exports.getUser = function(name) {
  return {
    username: name,
    password: name,
  };
};

module.exports.login = function(user) {
  browser.get('/#/login/');

  element(by.css('div.login-form a[data-role="switch-login-form"]')).click();
  element(by.model('auth.user.username')).sendKeys(user.username);
  element(by.model('auth.user.password')).sendKeys(user.password);
  element(by.css('div.inputs-box input[type=submit]')).click();
};

module.exports.logout = function(user) {
  browser.get('/#/dashboard/');

  element(by.css('ul.navbar-right li.dropdown a.dropdown-toggle')).click();
  element(by.cssContainingText('ul.navbar-right ul.dropdown-menu a', 'Logout')).click();
};
