/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addConstraint('playlist_song_activities', 'FK_playlist_song_activities.playlist_id_playlist.id', 'FOREIGN KEY (playlist_id) REFERENCES playlist(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  pgm.dropConstraint('playlist_song_activities', 'FK_playlist_song_activities.playlist_id_playlist.id');
};
