/* eslint-disable camelcase */
exports.up = (pgm) => {
  pgm.addConstraint('collaborations', 'FK_collaborations.user_id_users.id', 'FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  pgm.dropConstraint('collaborations', 'FK_collaborations.user_id_users.id');
};
