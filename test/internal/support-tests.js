var auth = require('../helpers/auth.js'),
    helpers = require('../helpers/helpers.js'),
    pages = require('../helpers/support-pages.js');

function gotoSupport() {
  element(by.css('ul.nav-list li.customer-support')).click();
}

describe('List and create issue', function() {
  var user = auth.getUser('Walter');
  var issue = {
    summary: "Not able to invite new user " + helpers.getUUID(),
    description: "When I click on add user button error message is displayed"
  };

  it('I should be able to login', function() {
    auth.login(user);
    expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/dashboard/');
  });

  it('I should be able to go to "Organization support" page', function() {
    gotoSupport();
    expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/support/');
  });

  it('I should be able to add new issue', function() {
    var listPage = new pages.ListIssuesPage();
    listPage.gotoCreateIssue();

    var createPage = new pages.CreateIssuePage();
    createPage.setSummary(issue.summary);
    createPage.setDescription(issue.description);
    createPage.submit();

    var listPage = new pages.ListIssuesPage();
    expect(listPage.containsIssue(issue.summary)).toBe(true);
  });

  it('I should be able to add new comment', function() {
    var listPage = new pages.ListIssuesPage();
    listPage.expandIssue(issue.summary);

    var comments = new pages.IssueCommentsFragment();
    var text = "Won't fix " + helpers.getUUID();
    comments.setText(text);
    comments.submit();
    expect(comments.contains(text)).toBe(true);
  })
})
