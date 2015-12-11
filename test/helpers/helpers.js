var constants = require('./constants.js');

module.exports.getUUID = function() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

module.exports.chooseCustomer = function(customerName) {
  if (element(by.cssContainingText('.dropdown.customers .customer-name', customerName)).isPresent()) {
    return true;
  }
  element(by.css('.dropdown.customers .customer-name')).click();
  element(by.cssContainingText('.dropdown.customers .nav-sublist li a', customerName)).click();
  browser.wait(function() {
    return element(by.cssContainingText('.details-container h1', 'Organization')).isPresent();
  }, constants.WATING_TIME);
};

module.exports.chooseProject = function(projectName) {
  element(by.css('.dropdown.project-dropdown .project-context')).click();
  element(by.cssContainingText('.dropdown.project-dropdown .nav-sublist li a', projectName)).click();
};

/**
 * Saves screenshot image to disk. Usage example:
 *
 *  browser.takeScreenshot().then(function(png) {
 *    helpers.writeScreenShot(png, 'exception.png');
 *  })
 *
 */
module.exports.writeScreenShot = function(data, filename) {
  var fs = require('fs');
  var stream = fs.createWriteStream(filename);
  stream.write(new Buffer(data, 'base64'));
  stream.end();
};