const moment = require('moment');

var generateMessage = (from, text) => {
  return {
    from: from,
    text: text,
    createdAt: moment().valueOf()
  };
};

var generateLocationMessage = (from, latitude, longitude) => {
  return {
    from,
    url: `http://google.com/maps?q=${latitude},${longitude}`,
    createdAt: moment().valueOf()
  }
}

module.exports = {generateMessage, generateLocationMessage};
