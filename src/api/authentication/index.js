const AuthenticationHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'authentication',
  version: '1.0.0',
  register: async (server, {
    authenticationService,
    usersService,
    tokenManager,
    validator,
  }) => {
    const authenticationHandler = new AuthenticationHandler(
      authenticationService,
      usersService,
      tokenManager,
      validator,
    );

    server.route(routes(authenticationHandler));
  },
};
