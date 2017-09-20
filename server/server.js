const path = require('path');
const express = require('express');

const port = process.env.PORT || 3000;
const public_path = path.join(__dirname, '../public')

var app = express();

app.use( express.static(public_path) );

app.get('/', (req, res) => {
  res.send('index.html');
});

app.listen(port, ()=> {
    console.log(`Server is up on port ${port}`);
})
