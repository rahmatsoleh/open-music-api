/* eslint-disable camelcase */
exports.up = (pgm) => {
  pgm.addConstraint('playlist', 'fk_playlist.owner_users.id', 'FOREIGN KEY(owner) REFERENCES users(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  pgm.dropConstraint('playlist', 'fk_playlist.owner_users.id');
};
