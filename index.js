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
          'xi-api-key': 'fd874048e4a4111ab753bd457f0ffa75'  // replace with your actual API key
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
                'xi-api-key': 'fd874048e4a4111ab753bd457f0ffa75',
                'Content-Type': 'application/json'
            },
            responseType: 'arraybuffer'  // this will ensure the data is in correct format
        });

        const audioBase64 = Buffer.from(response.data, 'binary').toString('base64');

        res.json({ audio: audioBase64 });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error occurred while making the text-to-speech API call');
    }
});

  



const upload = multer({ dest: 'uploads' });

app.post('/addVoice',upload.single('files'), async (req, res, next) => {
  try {
  let formdata = new FormData();

  formdata.append('files', fs.createReadStream(req.file.path), req.file.originalname);
  formdata.append('name', req.body.name);
  formdata.append('description', req.body.description);
  // formdata.append('labels', req.body.labels);
  console.log("🚀 ~ file: index.js:87 ~ app.post ~ formdata:", formdata.files)

  
  
  const response = await axios.post('https://api.elevenlabs.io/v1/voices/add', formdata, {
    headers: {
      ...formdata.getHeaders(), // this is the important part
      'xi-api-key': 'fd874048e4a4111ab753bd457f0ffa75'
    },
  });
    res.json(response.data);
  }catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
});
app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
