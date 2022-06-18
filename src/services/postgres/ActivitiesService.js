const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvarianError');
const NotFoundError = require('../../exceptions/NotFoundError');

class ActivitiesService {
  constructor(playlistService) {
    this._pool = new Pool();
    this._playlistService = playlistService;
  }

  async addActivities(playlistId, songId, owner) {
    const idActivities = nanoid(16);
    const action = 'add';
    const time = new Date().toISOString();

    const queryToActivities = {
      text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [idActivities, playlistId, songId, owner, action, time],
    };

    const resultActivities = await this._pool.query(queryToActivities);

    if (!resultActivities.rows[0].id) throw new InvariantError("Can't to add activities");
  }

  async deleteActivities(playlistId, songId, owner) {
    const idActivities = nanoid(16);
    const action = 'delete';
    const time = new Date().toISOString();

    const queryToActivities = {
      text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [idActivities, playlistId, songId, owner, action, time],
    };

    const resultActivities = await this._pool.query(queryToActivities);

    if (!resultActivities.rows[0].id) throw new InvariantError("Can't to delete song from activities");
  }

  async getActivitiesByPlaylistId(userId, playlistId) {
    await this._playlistService.verifyPlaylistOwner(playlistId, userId);
    const query = {
      text: 'SELECT username, title, action, time FROM users, songs, playlist_song_activities WHERE playlist_song_activities.user_id = users.id AND playlist_song_activities.song_id = songs.id AND playlist_song_activities.user_id = $1 AND playlist_song_activities.playlist_id = $2',
      values: [userId, playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) throw new NotFoundError(`${playlistId} is not found`);

    return result.rows;
  }
}

module.exports = ActivitiesService;
