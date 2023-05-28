class User {
  constructor(id, username, password, role, points, funds, address, vehicleId, privateKey) {
    this.id = id;
    this.username = username;
    this.password = password;
    this.role = role;
    this.points = points;
    this.funds = funds;
    this.address = address;
    this.vehicleId = vehicleId;
    this.privateKey = privateKey;
  }

  static fromDB(row) {
    return new User(row.id, row.username, row.password, row.role, row.points, row.funds, row.address, row.vehicleId, row.privateKey);
  }
}

module.exports = User;
