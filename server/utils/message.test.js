const expect = require('expect');
const {generateMessage, generateLocationMessage} = require('./message');

describe('function generateMessage', () => {

  var from = 'julio@gmail.com';
  var text = 'Hi my friend';

  it('should generate the correct message object', () => {
    var message = generateMessage(from, text);

    expect(message.createdAt).toBeA('number');
    expect(message).toInclude({
      from,
      text
    });
  });
});

describe('function generateLocationMessage', () =>{
  var from = 'jose@gmail.com';
  var lat = 20;
  var lon = 50;
  var url =`http://google.com/maps?q=${lat},${lon}`

  it('should generate correct location', () => {
    var locationMessage = generateLocationMessage(from, lat, lon);
    expect(locationMessage.createdAt).toBeA('number');
    expect(locationMessage.url).toBe(url);
  });
});
