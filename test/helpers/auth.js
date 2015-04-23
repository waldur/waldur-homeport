module.exports.getUser = function(name) {
  return {
    username: name,
    password: name,
  };
};

module.exports.login = function(user) {
  browser.driver.manage().window().setSize(1600, 900);
  browser.get('/#/login/');

  element(by.css('div.login-form a[data-role="switch-login-form"]')).click();
  element(by.model('auth.user.username')).sendKeys(user.username);
  element(by.model('auth.user.password')).sendKeys(user.password);
  element(by.css('div.inputs-box input[type=submit]')).click();
};

module.exports.logout = function(user) {
  browser.get('/#/dashboard/');

  element(by.css('ul.nav-list.context > li:nth-child(3) > a')).click();
  element(by.cssContainingText('ul.nav-list.context > li:nth-child(3) > ul > li > a', 'Logout')).click();
};
