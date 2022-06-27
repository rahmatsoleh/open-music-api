const ClientError = require('../../exceptions/ClientError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class ExportsHandler {
  constructor(service, playlist, validator) {
    this._service = service;
    this._validator = validator;
    this._playlist = playlist;

    this.postExportPlaylistHandler = this.postExportPlaylistHandler.bind(this);
  }

  async postExportPlaylistHandler(request, h) {
    try {
      this._validator.validateExportPlaylistPayload(request.payload);

      const { id: credentialId } = request.auth.credentials;
      const { playlistId } = request.params;
      const { targetEmail } = request.payload;

      await this._playlist.verifyPlaylistOwner(playlistId, credentialId);

      const message = {
        playlistId,
        targetEmail,
      };

      await this._service.sendMessage('export:openmusic', JSON.stringify(message));

      const response = h.response({
        status: 'success',
        message: 'Permintaan Anda dalam antrean',
      });
      response.code(201);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      if (error instanceof NotFoundError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      if (error instanceof AuthorizationError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server error
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

module.exports = ExportsHandler;
