const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const ActivitiesService = require('./ActivitiesService');
const CollaborationsService = require('./CollaborationService');
const InvariantError = require('../../exceptions/InvarianError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistService {
  constructor(songService, userService) {
    this._pool = new Pool();
    this._songService = songService;
    this._userSerVice = userService;
    this._collaborationService = new CollaborationsService(userService);
    this._activitiesService = new ActivitiesService();
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

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      try {
        await this._collaborationService.verifyCollaborator(playlistId, userId);
      } catch {
        throw error;
      }
    }
  }

  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;

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

    if (!result.rows.length) {
      const queryCollabs = {
        text: 'SELECT * FROM collaborations WHERE user_id = $1',
        values: [owner],
      };

      const resultCollabs = await this._pool.query(queryCollabs);

      if (!resultCollabs.rows.length) return result.rows;

      const playlistId = resultCollabs.rows[0].playlist_id;

      const queryPlaylist = {
        text: 'SELECT playlist.id, playlist.name, users.username FROM playlist LEFT JOIN users ON users.id = playlist.owner WHERE playlist.id = $1',
        values: [playlistId],
      };

      const resultPlaylist = await this._pool.query(queryPlaylist);

      return resultPlaylist.rows;
    }

    return result.rows;
  }

  async getPlaylistById(id) {
    const query = {
      text: 'SELECT playlist.id, playlist.name, users.username FROM playlist LEFT JOIN users ON users.id = playlist.owner WHERE playlist.id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) throw new NotFoundError('User is not found');

    return result.rows[0];
  }

  async postSongByIdPlaylist(owner, playlistId, songId) {
    await this._songService.getSongById(songId);

    await this._userSerVice.getUserById(owner);

    await this.verifyPlaylistAccess(playlistId, owner);

    const id = `playsong-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlist_songs VALUES ($1,$2,$3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) throw new InvariantError('Songs failure to Add');

    await this._activitiesService.addActivities(playlistId, songId, owner);

    return result.rows[0].id;
  }

  async getPlaylistByOwner(playlistId, owner) {
    await this.verifyPlaylistAccess(playlistId, owner);

    const query = {
      text: 'SELECT songs.id, songs.title, songs.performer FROM playlist_songs LEFT JOIN songs ON songs.id = playlist_songs.song_id WHERE playlist_songs.playlist_id = $1',
      values: [playlistId],
    };

    const result = await this._pool.query(query);
    const songs = result.rows;

    const playlist = await this.getPlaylistById(playlistId);

    return {
      id: playlist.id,
      name: playlist.name,
      username: playlist.username,
      songs,
    };
  }

  async deleteSongByIdPlaylist(owner, playlistId, songId) {
    await this._songService.getSongById(songId);

    await this._userSerVice.getUserById(owner);

    await this.verifyPlaylistAccess(playlistId, owner);

    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) throw new NotFoundError('Songs failure to delete');

    await this._activitiesService.deleteActivities(playlistId, songId, owner);
  }

  async deletePlaylist(playlistId, owner) {
    await this._userSerVice.getUserById(owner);

    await this.verifyPlaylistOwner(playlistId, owner);

    const query = {
      text: 'DELETE FROM playlist WHERE id = $1 RETURNING id',
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) throw new NotFoundError('Songs failure to delete');
  }
}

module.exports = PlaylistService;
