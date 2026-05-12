const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({
  origin: function (origin, cb) {
    cb(null, false);
  }
}));

app.post('/api/test', (req, res) => res.send('OK'));

app.use((req, res) => res.status(404).send('Not Found'));

const request = require('supertest');

request(app)
  .options('/api/test')
  .set('Origin', 'http://example.com')
  .end((err, res) => {
    console.log('Status for rejected origin OPTIONS:', res.status);
  });
