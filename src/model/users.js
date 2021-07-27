const db = require('../lib/db');

class Users {
  constructor(){
    this.connection = db.getDB().collection('users');
  }

  addExtraFileds(data){
    const filters = {};
    const { latitude, longitude, registered } = data;

    if (latitude && longitude) {
      filters.geozone = { type: 'Point', coordinates: [parseFloat(longitude), parseFloat(latitude)] };
    }

    if (registered) {
      filters.registered = new Date(registered);
    }

    return {
      ...data,
      filters
    };
  }

  async save(data){
    const doc = this.addExtraFileds(data);
    const _id = doc._id;
    const found = _id && (await this.connection.findOne({ _id }));

    if (found && found._id){
      const result = await this.connection.replaceOne({ '_id': found._id }, doc);
      return result;
    }

    const result = await this.connection.insertOne(doc);

    return result;
  }

  async find(query){
    let cursor = null;
    let results = [];

    try {
      cursor = await this.connection.find(query).sort({ registeredDate : -1 });
      results = await cursor.toArray();
    } catch (e) {
      console.log(e);
    } finally {
      cursor && await cursor.close();
    }

    return results.map(({ filters, ...r }) => r);
  }

  filterQuery(filters){
    const fields = { 'friends': 'friends.name', 'id': '_id', 'registered': 'filters.registered', 'geozone' : 'filters.geozone' };
    const types = { 'geozone': 'geo', 'registered': 'date' };

    const geoStrategy = (key, value, type) => {
      if (type !== 'geo'){
        return false;
      }

      const s = value.split(',');

      if (s.length !== 2) {
        return null;
      }

      const geoValue = { '$near': { '$geometry': { index: 'Point', coordinates: s.map(n => parseFloat(n)) }, '$maxDistance': 5000 } };

      return [key, geoValue];
    };

    const dateStrategy = (key, value, type) => {
      if (type !== 'date'){
        return false;
      }

      const isString = typeof value === 'string';

      if (!isString && value && (value.min || value.max)) {
        const range = {};

        if (value.min) {
          range['$gte'] = new Date(value.min);
        }

        if (value.max) {
          range['$lte'] = new Date(value.max);
        }

        return [key, range];
      }

      if (!isString) {
        return null;
      }

      return [key, new Date(value)];
    };

    const stringStrategy = (key, value) => {
      if (typeof value !== 'string') {
        return false;
      }

      const s = value.split(',');

      if(s.length <= 1){
        return [key, value];
      }

      return [key, { '$all': s }];
    };

    const arrayStrategy = (key, value) => {
      if (!Array.isArray(value)) {
        return false;
      }

      return [key, { '$all': value }];
    };

    const runStrategies = ([k, value]) => {
      const key = fields[k] || k;
      const type = types[k] || null;
      let returned = [k, value];

      [geoStrategy, dateStrategy, stringStrategy, arrayStrategy].some(f => {
        const result = f(key, value, type);
        if (result !== false) {
          returned = result;
          return true;
        }

        return false;
      });

      return returned;
    };

    return filters.map(runStrategies).filter(e => e !== null).reduce((o, [k, v]) => ({...o, [k]: v }) ,{});
  }
}

module.exports = Users;
