const expect = require('expect');
const {generateMessage} = require('./message');

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
