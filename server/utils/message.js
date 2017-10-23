const moment = require('moment');

var generateMessage = (from, text) => {
  return {
    from: from,
    text: text,
    createdAt: moment().valueOf(),
    url: false
  };
};

var generateLocationMessage = (from, latitude, longitude) => {
  return {
    from: from,
    text: `http://google.com/maps?q=${latitude},${longitude}`,
    createdAt: moment().valueOf(),
    url: true
  }
}

module.exports = {generateMessage, generateLocationMessage};
