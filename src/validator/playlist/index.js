const InvariantError = require('../../exceptions/InvarianError');
const ClientError = require('../../exceptions/ClientError');
const { PlaylistPayloadSchema, SongToPlaylistSchema } = require('./schema');

const PlaylistValidator = {
  validatePlaylistPayload: (payload) => {
    const validationResult = PlaylistPayloadSchema.validate(payload);

    if (validationResult.error) throw new InvariantError(validationResult.error.message);
  },

  validateSongIdPayload: (payload) => {
    const validationResult = SongToPlaylistSchema.validate(payload);

    if (validationResult.error) throw new ClientError(validationResult.error.message);
  },
};

module.exports = PlaylistValidator;
