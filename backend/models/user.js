class User {
  constructor(id, username, password, role, points, address) {
    this.id = id;
    this.username = username;
    this.password = password;
    this.role = role;
    this.points = points;
    this.address = address;
  }

  static fromDB(row) {
    return new User(row.id, row.username, row.role, row.password, row.points, row.address);
  }
}

module.exports = User;
