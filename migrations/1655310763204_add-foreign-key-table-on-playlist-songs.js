/* eslint-disable camelcase */
exports.up = (pgm) => {
  // Add foreign key to table playlist
  pgm.addConstraint('playlist_songs', 'fk_playlist_songs.playlist_id_playlist.id_playlist.id', 'FOREIGN KEY (playlist_id) REFERENCES playlist(id) ON DELETE CASCADE');

  // Add foreign key to table songs
  pgm.addConstraint('playlist_songs', 'fk_playlist_songs.song_id_songs.id', 'FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  // Delete Foreign key to table playlist
  pgm.dropConstraint('playlist_songs', 'fk_playlist_songs.playlist_id_playlist.id_playlist.id');

  // Delete Foreign key to table songs
  pgm.dropConstraint('playlist_songs', 'fk_playlist_songs.song_id_songs.id');
};
