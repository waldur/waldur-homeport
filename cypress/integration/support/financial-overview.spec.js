describe('Financial overview', () => {
  beforeEach(() => {
    cy
      .server()
      .mockUser()
      .login();
  });

  it('should render current cost and estimated cost columns if current month is selected', () => {
    cy
      .visitOrganizations()
      .get('table th').contains('Current cost')
      .get('table th').contains('Estimated cost')
      .get('table th').contains('Cost').should('not.exist');
  });

  it('should render cost column if previous month is selected', () => {
    cy
      .visitOrganizations()
      .get('div.Select-control input').first().click({ force: true })
      .get('.Select-option').last().click()
      .get('table th').contains('Current cost').should('not.exist')
      .get('table th').contains('Estimated cost').should('not.exist')
      .get('table th').contains('Cost');
  });

  it('should render total cost of €138.00', () => {
    cy
      .visitOrganizations()
      .get('.text-right').should('contain', '€138.00');
  });
});
