const LikeHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'likes',
  version: '1.0.0',
  register: async (server, { service }) => {
    const likeHandler = new LikeHandler(service);
    server.route(routes(likeHandler));
  },
};
