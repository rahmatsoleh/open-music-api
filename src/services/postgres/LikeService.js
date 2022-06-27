const { nanoid } = require('nanoid');
const { Pool } = require('pg');

class LikeService {
  constructor(albumService, cacheService) {
    this._pool = new Pool();
    this._albumService = albumService;
    this._cacheService = cacheService;
  }

  async cekLikeAlbumByUser(albumId, userId) {
    await this._albumService.getAlbumById(albumId);

    const query = {
      text: 'SELECt * FROM user_album_likes WHERE album_id = $1 AND user_id = $2',
      values: [albumId, userId],
    };

    const result = await this._pool.query(query);

    return result.rows.length;
  }

  async getLikeAlbums(albumId) {
    try {
      const result = await this._cacheService.get(`album:${albumId}`);

      return JSON.parse(result);
    } catch (error) {
      await this._albumService.getAlbumById(albumId);

      const query = {
        text: 'SELECT * FROM user_album_likes WHERE album_id = $1',
        values: [albumId],
      };

      const result = await this._pool.query(query);
      const resultCount = result.rows.length;

      await this._cacheService.set(`album:${albumId}`, JSON.stringify(resultCount));

      return resultCount;
    }
  }

  async postLike(albumId, userId) {
    const getCountLike = await this.cekLikeAlbumByUser(albumId, userId);

    if (getCountLike > 0) {
      const query = {
        text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id',
        values: [userId, albumId],
      };

      const result = await this._pool.query(query);

      await this._cacheService.delete(`album:${albumId}`);

      return {
        albumId: result.rows[0].id,
        message: `${result.rows[0].id} is liked`,
      };
    }

    const query = {
      text: 'INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id',
      values: [`like-${nanoid(16)}`, userId, albumId],
    };

    const result = await this._pool.query(query);

    await this._cacheService.delete(`album:${albumId}`);

    return {
      albumId: result.rows[0].id,
      message: `${result.rows[0].id} is liked`,
    };
  }
}

module.exports = LikeService;
