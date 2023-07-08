const express = require('express');
const axios = require('axios'); // require axios
const cors = require('cors');
const app = express();
const multer = require('multer');
const port = 3000;


app.use(express.json()); 
app.use(cors()); 
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

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
const upload = multer();

// Define route to handle adding voices
app.post('/voices/add', upload.single('files'), async (req, res) => {
  const name = req.body.name;
  const description = req.body.description;
  const labels = req.body.labels;
  const file = req.file;

  try {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('labels', labels);
    formData.append('files', file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype
    });

    const response = await axios.post('https://api.elevenlabs.io/v1/voices/add', formData, {
      headers: {
        'Accept': 'application/json',
        'xi-api-key': '0aa0dd7a5776e591c74e58be393f6b21',
        ...formData.getHeaders()
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error occurred while adding voice');
  }
});
  
app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
