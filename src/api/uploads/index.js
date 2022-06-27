const UploadHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'uploads',
  version: '1.0.0',
  register: async (server, { storageService, albumService, validator }) => {
    const uploadsHandler = new UploadHandler(storageService, albumService, validator);
    server.route(routes(uploadsHandler));
  },
};
