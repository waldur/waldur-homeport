module.exports.getUser = function(name) {
  return {
    username: name,
    password: name,
  };
};

module.exports.login = function(user) {
  browser.driver.manage().window().setSize(1600, 900);
  browser.get('/#/login/');

  element(by.model('auth.user.username')).sendKeys(user.username);
  element(by.model('auth.user.password')).sendKeys(user.password);
  element(by.css('.button-login')).click();
};

module.exports.logout = function(user) {
  browser.get('/#/dashboard/');

  element(by.css('ul.nav-list.context > li:nth-child(4) > a')).click();
  element(by.cssContainingText('ul.nav-list.context > li:nth-child(4) > ul > li > a', 'Logout')).click();
};
