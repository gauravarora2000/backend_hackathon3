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

app.post('/conversation', async (req, res) => {
  const data = req.body;
  try {
    let prompts = data.text.split('#');
    let voice_ids = []
    let audio = []
    let pause = "...,,,,,,,"
    for (i=0;i<prompts.length;i=i+2){
      let voice_name = prompts[i].replace('[','').replace(']','')
      let voice_prompt = prompts[i+1]
      console.log("Voice = " + voice_name)
      console.log("Prompt = " + voice_prompt)
      const response = await axios.get('https://api.elevenlabs.io/v1/voices', {
            headers: {
              'Accept': 'application/json',
              'xi-api-key': '0aa0dd7a5776e591c74e58be393f6b21'  // replace with your actual API key
            }
          });
      let voices = response.data.voices
      let voice_id
      console.log("Voices = " + voices.length)
        for(j=0;j<voices.length;j++){
          if(voices[j].name === voice_name){
            voice_ids.push({[voice_name]:voices[j].voice_id})
            data.text = voice_prompt + pause
            const response = await axios.post(`https://api.elevenlabs.io/v1/text-to-speech/${voices[j].voice_id}?optimize_streaming_latency=0`, data, {
                headers: {
                    'accept': 'audio/mpeg',
                    'xi-api-key': '0aa0dd7a5776e591c74e58be393f6b21',
                    'Content-Type': 'application/json'
                },
                responseType: 'arraybuffer'  // this will ensure the data is in correct format
            });
      
            const audioBase64 = Buffer.from(response.data, 'binary').toString('base64');
            audio.push(response.data)
            break
          }
        } 
      
    }
    let l = 0
    for(k=0;k<audio.length;k++)
      l = l + audio[k].byteLength;
    console.log("Length = "+ l)
      // Create a new ArrayBuffer that can hold both input buffers
      let temp = Buffer.concat(audio)
    
    console.log(temp.buffer)
    res.send({audio:Buffer.from(temp.buffer, 'binary').toString('base64')});
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
