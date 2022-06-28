const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvarianError = require('../../exceptions/InvarianError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapSongModel } = require('../../utils/index');

class SongsService {
  constructor(cache) {
    this.pool = new Pool();
    this._cache = cache;
  }

  async addSong({
    title, year, genre, performer, duration, albumId,
  }) {
    const id = `song-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO songs VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, title, year, performer, genre, duration, albumId],
    };

    const result = await this.pool.query(query);

    if (!result.rows[0].id) {
      throw new InvarianError(`${title} berhasil ditambahkan...`);
    }

    return result.rows[0].id;
  }

  async getSongs(title, performer) {
    if (title && performer) {
      const result = await this.pool.query(`SELECT id, title, performer FROM songs WHERE UPPER(title) LIKE UPPER('${title}') AND UPPER(performer) LIKE UPPER('${performer}')`);
      return result.rows;
    }

    if (title || performer) {
      const result = await this.pool.query(`SELECT id, title, performer FROM songs WHERE UPPER(title) LIKE UPPER('${title}') OR UPPER(performer) LIKE UPPER('${performer}')`);
      return result.rows;
    }

    const result = await this.pool.query('SELECT id, title, performer FROM songs');
    return result.rows;
  }

  async getSongById(id) {
    try {
      const cache = await this._cache.get(`song:${id}`);

      return JSON.parse(cache);
    } catch (error) {
      const query = {
        text: 'SELECT * FROM songs WHERE id = $1',
        values: [id],
      };

      const result = await this.pool.query(query);

      if (!result.rows.length) {
        throw new NotFoundError(`${id} Tidak ditemukan !`);
      }

      const response = result.rows.map(mapSongModel)[0];

      await this._cache.set(`song:${id}`, JSON.stringify(response));

      return response;
    }
  }

  async editSongById(id, {
    title, year, genre, performer, duration, albumId,
  }) {
    const query = {
      text: 'UPDATE songs SET title=$1, year=$2, genre=$3, performer=$4, duration=$5, album_id=$6 WHERE id=$7 RETURNING id',
      values: [title, year, genre, performer, duration, albumId, id],
    };

    const result = await this.pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError(`Gagal ! ${id} Tidak ditemukan`);
    }

    await this._cache.delete(`song:${id}`);
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this.pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError(`Gagal! ID ${id} Tidak ditemukan...`);
    }

    await this._cache.delete(`song:${id}`);
  }

  async getSongsByAlbumId(albumId) {
    const query = {
      text: 'SELECT id, title, performer FROM songs WHERE album_id=$1',
      values: [albumId],
    };

    const result = await this.pool.query(query);

    if (!result.rows.length) {
      return [];
    }

    return result.rows;
  }
}

module.exports = SongsService;
