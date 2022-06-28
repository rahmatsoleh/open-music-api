const NotFoundError = require('../../exceptions/NotFoundError');

class LikeHandler {
  constructor(service) {
    this._service = service;

    this.postLikeHandler = this.postLikeHandler.bind(this);
    this.getLikeHandler = this.getLikeHandler.bind(this);
  }

  async postLikeHandler(request, h) {
    try {
      const { id: credentialId } = request.auth.credentials;
      const { id: albumId } = request.params;

      const album = await this._service.postLike(albumId, credentialId);

      const response = h.response({
        status: 'success',
        message: album.message,
        albumId: album.albumId,
      });

      response.code(201);
      return response;
    } catch (error) {
      if (error instanceof NotFoundError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      const response = h.response({
        status: 'error',
        message: 'Upps... Something wrong in our server',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async getLikeHandler(request, h) {
    try {
      const { id: albumId } = request.params;

      const result = await this._service.getLikeAlbums(albumId);
      const { cache, count: likes } = result;

      const response = h.response({
        status: 'success',
        data: {
          likes,
        },
      });
      if (cache) {
        response.header('X-Data-Source', 'cache');
      }
      response.code(200);
      return response;
    } catch (error) {
      if (error instanceof NotFoundError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      const response = h.response({
        status: 'error',
        message: 'Upps... Something wrong in our server',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }
}

module.exports = LikeHandler;
