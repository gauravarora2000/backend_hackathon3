   // Select the buttons and define variables
   let recordButton = document.getElementById('record');
   let stopButton = document.getElementById('stop');
   let submitButton = document.getElementById('submitAudio');
   let audioPlayer = document.getElementById('audioPlayer');
   let chunks = [];
   let mediaRecorder;
   let voicesData;

   // Ask permission and start recording
   recordButton.onclick = async function() {
     let stream = await navigator.mediaDevices.getUserMedia({ audio: true });
     mediaRecorder = new MediaRecorder(stream);
     mediaRecorder.start();

     mediaRecorder.ondataavailable = function(e) {
       chunks.push(e.data);
     };
   }

   // Stop recording and update audio player source
   stopButton.onclick = function() {
     mediaRecorder.stop();
     mediaRecorder.onstop = function() {
       let blob = new Blob(chunks, { 'type' : 'audio/ogg; codecs=opus' });
       let url = URL.createObjectURL(blob);
       audioPlayer.src = url;
       chunks = []; // Clear the chunks array
     }
   }

   // Submit the audio
   submitButton.onclick = function() {
     let blob = new Blob(chunks, { 'type' : 'audio/ogg; codecs=opus' });
     let formData = new FormData();
     formData.append('audio', blob);

     let fileInput = document.getElementById('audioFile');
     if(fileInput.files.length > 0) {
       formData.append('audioFile', fileInput.files[0]);
     }

     fetch('/submit-audio', {
       method: 'POST',
       body: formData
     })
     .then(() => console.log("Audio submitted..."))
     .catch(error => console.log("Error:", error));
   }

 

 // Perform the fetch request on page load
window.onload = function() {
  fetch('http://localhost:3000/fetch-voices')
  .then(response => response.json())
  .then(data => {
    voicesData=data;
    
    const voicesDropdown = document.getElementById('voicesDropdown');
    
    // Loop through each voice in the response
    data.voices.forEach(voice => {
      // Create a new <option> element for the dropdown
      const option = document.createElement('option');
      
      // Set the text and value of the option
      option.text = voice.name;
      option.value = voice.voice_id;
      
      // Add the option to the dropdown
      voicesDropdown.add(option);
    });
  })
  .catch(error => console.error('Error:', error));
};




const button = document.getElementById('submitText');
button.addEventListener('click', makeAPICall);

function makeAPICall() {
  const voiceId = '21m00Tcm4TlvDq8ikWAM'; // replace with the actual voice ID
  const data = {
    text: document.getElementById('textInput').value,
    model_id: 'eleven_monolingual_v1',
    voice_settings: {
      stability: 0,
      similarity_boost: 0,
      style: 0.5,
      use_speaker_boost: false
    }
  };

  fetch(`http://localhost:4001/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'xi-api-key': '0aa0dd7a5776e591c74e58be393f6b21',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  .then(response => response.blob())
  .then(blob => {
    // Create a temporary URL for the blob object
    const audioURL = URL.createObjectURL(blob);

    // Play the audio using an HTML audio element
    const audioPlayer = new Audio(audioURL);
    audioPlayer.play();
  })
  .catch(error => console.error(error));
}


async function getAudio() {
  try {
    const textToSpeechData = {
      text: "Text to convert to speech",
      model_id: "eleven_monolingual_v1",
      voice_settings: {
          stability: 0,
          similarity_boost: 0,
          style: 0.5,
          use_speaker_boost: false
      }
  };
  

      let res = await fetch(`http://localhost:4001/text-to-speech/21m00Tcm4TlvDq8ikWAM`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json',
          'xi-api-key': 'fd874048e4a4111ab753bd457f0ffa75' },
          body: JSON.stringify(textToSpeechData)
      });

      let data = await res.json();
      let audio = document.getElementById('audioPlayer');
      let source = document.getElementById('audioSource');

      source.src = `data:audio/mpeg;base64,${data.audio}`;
      audio.load();  // This will load the new source

  } catch (error) {
      console.error('Error:', error);
  }
}

