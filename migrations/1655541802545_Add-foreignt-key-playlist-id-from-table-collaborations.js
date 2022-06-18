/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addConstraint('collaborations', 'FK_collaborations.playlist_id_playlist.id', 'FOREIGN KEY (playlist_id) REFERENCES playlist(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  pgm.dropConstraint('collaborations', 'FK_collaborations.playlist_id_playlist.id');
};
