module.exports.getUUID = function() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

module.exports.chooseCustomer = function(customerName) {
  element(by.cssContainingText('a.customer-head span.customer-expl', 'active for context')).click();
  element(by.cssContainingText('ul li:nth-child(2) ul li a', customerName)).click();
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