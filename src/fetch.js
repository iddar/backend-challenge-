const fetch = require('node-fetch')

/** @typedef {Object} user
 * @property {String} _id
 * @property {String} about
 * @property {String} address
 * @property {Number} age
 * @property {String} balance
 * @property {String} company
 * @property {String} email
 * @property {String} eyeColor
 * @property {String} favoriteFruit
 * @property {Array<friend>} friends
 * @property {String} greeting
 * @property {String} guid
 * @property {Number} index
 * @property {Boolean} isActive
 * @property {String} latitude
 * @property {String} longitude
 * @property {fullname} name
 * @property {String} phone
 * @property {String} picture
 * @property {Array<Number>} range
 * @property {String} registered
 * @property {Array<String>} tags
 */

 /** @typedef {Object} fullname
 * @property {String} first
 * @property {String} last
 */

 /** @typedef {Object} friend
 * @property {Number} id
 * @property {String} name
 */

module.exports = {
  /**
   * getAPI
   * @returns {Promise<Array<user>>}
   */
  async usersCollection () {
    const blob = await fetch('http://localhost:8000')
    const data = await blob.json()
    return data
  }
}
