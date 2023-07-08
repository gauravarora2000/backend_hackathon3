const express = require('express');
const axios = require('axios'); // require axios
const cors = require('cors');
const app = express();
const multer = require('multer');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
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

app.post('/addVoice', async (req, res) => {
  const formData = new FormData();

  // append fields to the formData
  formData.append('name', 'test');
  formData.append('description', 'test123');
  formData.append('labels', '');

  // append the file to formData
  const fileStream = fs.createReadStream('AudioSamples/4.mp3');
  formData.append('files', fileStream);

  try {
      const response = await axios({
          method: 'post',
          url: 'https://api.elevenlabs.io/v1/voices/add',
          data: formData,
          headers: { 
              ...formData.getHeaders(),
              'accept': 'application/json',
              'xi-api-key': '0aa0dd7a5776e591c74e58be393f6b21' 
          },
      });

      // Send response data back to the client
      res.json(response.data);
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred' });
  }
});

  
app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
