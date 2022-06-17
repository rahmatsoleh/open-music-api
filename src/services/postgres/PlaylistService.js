const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvarianError');
const ClientError = require('../../exceptions/ClientError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistService {
  constructor(songService, userService) {
    this._pool = new Pool();
    this._songService = songService;
    this._userSerVice = userService;
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM playlist WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) throw new NotFoundError('Playlist is not found');

    const playlist = result.rows[0];

    if (playlist.owner !== owner) throw new AuthorizationError('You cannot access this resource');
  }

  async addPlaylist({ name, owner }) {
    const id = nanoid(16);

    const query = {
      text: 'INSERT INTO playlist VALUES ($1,$2,$3) RETURNING id',
      values: [id, name, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) throw new InvariantError('Playlist failure to Add');

    return result.rows[0].id;
  }

  async getPlaylists(owner) {
    const query = {
      text: 'SELECT playlist.id, playlist.name, users.username FROM playlist LEFT JOIN users ON users.id = playlist.owner WHERE playlist.owner = $1',
      values: [owner],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }

  async postSongByIdPlaylist(owner, playlistId, songId) {
    await this._songService.getSongById(songId);

    await this._userSerVice.getUserById(owner);

    await this.verifyPlaylistOwner(playlistId, owner);

    const id = nanoid(16);

    const query = {
      text: 'INSERT INTO playlist_songs VALUES ($1,$2,$3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) throw new InvariantError('Songs failure to Add');

    return result.rows[0].id;
  }
}

module.exports = PlaylistService;
