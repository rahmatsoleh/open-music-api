/* eslint-disable camelcase */
exports.up = (pgm) => {
  pgm.addConstraint('user_album_likes', 'FK_likes.user_id_user.id', 'FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE');

  pgm.addConstraint('user_album_likes', 'FK_likes.album_id_albums.id', 'FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  pgm.dropConstraint('user_album_likes', 'FK_likes.user_id_user.id');

  pgm.dropConstraint('user_album_likes', 'FK_likes.album_id_albums.id');
};
