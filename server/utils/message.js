var generateMessage = (from, text) => {
  return {
    from: from,
    text: text,
    createdAt: new Date().getTime()
  };
};

var generateLocationMessage = (from, latitude, longitude) => {
  return {
    from,
    url: `http://google.com/maps?q=${latitude},${longitude}`,
    createdAt: new Date().getTime()
  }
}

module.exports = {generateMessage, generateLocationMessage};
