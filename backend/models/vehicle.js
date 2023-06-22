const db = require('../database/db');

class Vehicle {
  constructor(id, make, model, pricePerHour, maxRentalHours, startTime, currentRenter, active) {
    this.id = id;
    this.make = make;
    this.model = model;
    this.pricePerHour = pricePerHour;
    this.maxRentalHours = maxRentalHours;
    this.startTime = startTime;
    this.currentRenter = currentRenter;
    this.active = active;
  }

  // CREATE operation
  save(callback) {
    const sql = `
      INSERT INTO vehicles(id, make, model, pricePerHour, maxRentalHours, startTime, currentRenter, active) 
      VALUES(?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.run(sql, [this.id, this.make, this.model, this.pricePerHour, this.maxRentalHours, this.startTime, this.currentRenter, this.active], function(err) {
      callback(err, this.lastID);
    });
  }

  // READ operation
  static getById(id, callback) {
    const sql = `SELECT * FROM vehicles WHERE id = ?`;
    db.get(sql, [id], (err, row) => {
      callback(err, row);
    });
  }

  // UPDATE operation
  update(callback) {
    const sql = `
      UPDATE vehicles 
      SET make = ?, model = ?, pricePerHour = ?, maxRentalHours = ?, startTime = ?, currentRenter = ?, active = ? 
      WHERE id = ?
    `;
    db.run(sql, [this.make, this.model, this.pricePerHour, this.maxRentalHours, this.startTime, this.currentRenter, this.active, this.id], err => {
      callback(err);
    });
  }

  // DELETE operation
  delete(callback) {
    const sql = `DELETE FROM vehicles WHERE id = ?`;
    db.run(sql, [this.id], err => {
      callback(err);
    });
  }
}

module.exports = Vehicle;
