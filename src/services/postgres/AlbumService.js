const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvarianError = require('../../exceptions/InvarianError');
const NotFoundError = require('../../exceptions/NotFoundError');
const SongService = require('./SongService');

class AlbumService {
  constructor() {
    this.pool = new Pool();
    this.songs = new SongService();
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO albums VALUES ($1, $2, $3) RETURNING id',
      values: [id, name, year],
    };

    const result = await this.pool.query(query);

    if (!result.rows[0].id) {
      throw new InvarianError('Catatan gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getAlbumById(albumId) {
    const query = {
      text: 'SELECT * FROM albums WHERE id=$1',
      values: [albumId],
    };

    const result = await this.pool.query(query);
    const songs = await this.songs.getSongsByAlbumId(albumId);

    if (!result.rows.length) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    const {
      id, name, year, cover,
    } = result.rows[0];

    const coverUrl = cover ? `http://${process.env.HOST}:${process.env.PORT}/images/${cover}` : cover;

    return {
      id,
      name,
      year,
      coverUrl,
      songs,
    };
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id],
    };

    const result = await this.pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError(`Gagal! ID ${id} Tidak ditemukan...`);
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this.pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError(`Gagal! ID ${id} Tidak ditemukan...`);
    }
  }

  async updateCover(albumId, filename) {
    const query = {
      text: 'UPDATE albums SET cover = $1 WHERE id = $2',
      values: [filename, albumId],
    };

    await this.pool.query(query);
  }
}

module.exports = AlbumService;
