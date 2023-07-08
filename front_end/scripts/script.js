const SERVER = "http://localhost:3000";
let chunks = [];

//jQuery time
var current_fs, next_fs, previous_fs; //fieldsets
var left, opacity, scale; //fieldset properties which we will animate
var animating; //flag to prevent quick multi-click glitches

// $(".next").click(function(){
function nextClick(button) {
  if(animating) return false;
  animating = true;
  
  current_fs = button.parent();
  next_fs = button.parent().next();
  
  //activate next step on progressbar using the index of next_fs
  $("#progressbar li").eq($("fieldset").index(next_fs)).addClass("active");
  
  //show the next fieldset
  next_fs.show(); 
  //hide the current fieldset with style
  current_fs.animate({opacity: 0}, {
    step: function(now, mx) {
      //as the opacity of current_fs reduces to 0 - stored in "now"
      //1. scale current_fs down to 80%
      scale = 1 - (1 - now) * 0.2;
      //2. bring next_fs from the right(50%)
      left = (now * 50)+"%";
      //3. increase opacity of next_fs to 1 as it moves in
      opacity = 1 - now;
      current_fs.css({
        'transform': 'scale('+scale+')',
        'position': 'absolute'
      });
      next_fs.css({'left': left, 'opacity': opacity});
    }, 
    duration: 800, 
    complete: function(){
      current_fs.hide();
      animating = false;
    }, 
    //this comes from the custom easing plugin
    easing: 'easeInOutBack'
  });
// });
};

$(".previous").click(function(){
  if(animating) return false;
  animating = true;
  
  current_fs = $(this).parent();
  previous_fs = $(this).parent().prev();
  
  //de-activate current step on progressbar
  $("#progressbar li").eq($("fieldset").index(current_fs)).removeClass("active");
  
  //show the previous fieldset
  previous_fs.show(); 
  //hide the current fieldset with style
  current_fs.animate({opacity: 0}, {
    step: function(now, mx) {
      //as the opacity of current_fs reduces to 0 - stored in "now"
      //1. scale previous_fs from 80% to 100%
      scale = 0.8 + (1 - now) * 0.2;
      //2. take current_fs to the right(50%) - from 0%
      left = ((1-now) * 50)+"%";
      //3. increase opacity of previous_fs to 1 as it moves in
      opacity = 1 - now;
      current_fs.css({'left': left});
      previous_fs.css({'transform': 'scale('+scale+')', 'opacity': opacity});
    }, 
    duration: 800, 
    complete: function(){
      current_fs.hide();
      animating = false;
    }, 
    //this comes from the custom easing plugin
    easing: 'easeInOutBack'
  });
});

$('#voice_files').change(function (e) {
    console.log("e", Array.from(e.target.files).map(function (file) {
        return file.name
    }).join(", "))
    
    $("#voice_file_name").text(Array.from(e.target.files).map(function (file) {
        return file.name
    }).join(", "));
})
// $('#voice_files').change(function (e) {
//     alert("hola");
// });

 // Submit the audio files to generate and train voice templates 
$("#create_voice_template").click(function() {
  let blob = new Blob(chunks, { 'type' : 'audio/ogg; codecs=opus' });
  let formData = new FormData();
  formData.append('audio', blob);

  let fileInput = document.getElementById("voice_files");
  if(fileInput.files.length > 0) {
    formData.append('audioFile', fileInput.files[0]);
  }
  formData.append('templateName', $("[name=template_name]").val());

  fetch(SERVER + '/addVoice', {
    method: 'POST',
    body: formData
  })
  .then(response => {
    console.log("Audio submitted...",response);
    return response.json();
  })
  .then(voiceData => {
    sessionStorage.setItem('voiceId', voiceData.voice_id)
    nextClick($(this))
    fetch(SERVER + '/fetch-voices')
    .then(response => response.json())
    .then(data => {
      voicesData=data;
      
      const voicesDropdown = document.getElementById('voice_template');
      
      // Loop through each voice in the response
      data.voices.forEach(voice => {
        // Create a new <option> element for the dropdown
        const option = document.createElement('option');
        
        // Set the text and value of the option
        option.text = voice.name;
        option.value = voice.voice_id;
        if(voice.voice_id === sessionStorage.getItem('voiceId')) {
          option.setAttribute("selected", "true");
        }
        
        // Add the option to the dropdown
        voicesDropdown.add(option);
      });
    })
  })
  .catch(error => console.log("Error:", error));
});

$("#generate_voice").click(function(){
    const voiceId = $("#voice_template").val();
    const data = {
      text: $("[name=text_phrase]").val(),
      model_id: 'eleven_monolingual_v1',
      voice_settings: {
        stability: 0,
        similarity_boost: 0,
        style: 0.5,
        use_speaker_boost: false
      }
    };
  
    fetch(`http://localhost:3000/text-to-speech/${voiceId}`, {
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
      const audioURL = URL.createObjectURL(blob);
      console.log("audioURL", audioURL)
      // Play the audio using an HTML audio element
      // document.getElementById('audio-file-source').src = audioURL;
      document.getElementById('audio-file').src = audioURL;
      // document.getElementById('audio-file').load();
      nextClick($(this))
    })
    .catch(error => console.error(error));
})