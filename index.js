const express = require('express');
const axios = require('axios'); // require axios
const cors = require('cors');
const app = express();
const multer = require('multer');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const port = 4001;


app.use(express.json()); 
app.use(cors()); 
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.get('/dummy',(req, res) => {
  res.status(200).json({
    success: true,
    greeting: `Hello from API!`,
  });
});

app.get('/fetch-voices', async (req, res) => {
    try {
      const response = await axios.get('https://api.elevenlabs.io/v1/voices', {
        headers: {
          'Accept': 'application/json',
          'xi-api-key': '0aa0dd7a5776e591c74e58be393f6b21'  // replace with your actual API key
        }
      });
      res.json(response.data);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error occurred while fetching voices');
    }
  });


  app.post('/text-to-speech/:voiceId', async (req, res) => {
    const voiceId = req.params.voiceId;
    const data = req.body;
  
    try {
      const response = await axios.post(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?optimize_streaming_latency=0`, data, {
        headers: {
          'accept': 'audio/mpeg',
          'xi-api-key': '0aa0dd7a5776e591c74e58be393f6b21',
          'Content-Type': 'application/json'
        }
      });
  
      res.send(response.data);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error occurred while making the text-to-speech API call');
    }
  });

  

// Multer configuration for handling file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '/tmp');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage });

app.post('/addVoice', upload.array('files', 50), async (req, res) => {
  try {
    const form = new FormData();

    // Append fields to the form
    form.append('name', req.body.name);
    form.append('description', req.body.description);
    form.append('labels', req.body.labels);

    // Append the files to form-data
    for (const file of req.files) {
      form.append('files', fs.createReadStream(file.path), file.originalname);
    }

    const response = await axios.post('https://api.elevenlabs.io/v1/voices/add', form, {
      headers: {
        ...form.getHeaders(),
        'accept': 'application/json',
        'xi-api-key': '0aa0dd7a5776e591c74e58be393f6b21'
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
});


app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
