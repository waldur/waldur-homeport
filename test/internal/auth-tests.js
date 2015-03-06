describe('signin, signup and logout tests', function() {

  it('I go to login URL then I click on "sign me up!" button', function() {
    browser.get('/');
    element(by.css('.take-a-tour')).click();

    expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/login/');
  });

});
