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

  browser.wait(function (){
    return element(by.css('.user-dropdown .user-name')).isPresent();
  }, 10000);

  element(by.css('.user-dropdown .user-name')).click();
  element(by.cssContainingText('ul.nav-sublist.user-area li a', 'Logout')).click();
};
