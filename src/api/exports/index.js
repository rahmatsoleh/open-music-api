const ExportsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'exports',
  version: '1.0.0',
  register: async (server, { service, playlist, validator }) => {
    const exportsHandler = new ExportsHandler(service, playlist, validator);

    server.route(routes(exportsHandler));
  },
};
