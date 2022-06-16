/* eslint-disable camelcase */
const mapSongModel = ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  album_id,
  username,
}) => ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  albumId: album_id,
  username,
});

module.exports = { mapSongModel };
