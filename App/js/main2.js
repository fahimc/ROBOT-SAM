(function(){
	var Main=window.Main=
	{
		init:function(){
			

			document.addEventListener('DOMContentLoaded',this.onLoad.bind(this));
		},
		onLoad:function(){
var utterance = new SpeechSynthesisUtterance('Hello Treehouse');
window.speechSynthesis.speak(utterance);
			this.start();
		},
		start:function(){
			var recognition = new webkitSpeechRecognition();
			recognition.continuous = true; 
			recognition.onresult = function(event) { 
				var results = event.results;
				for(var a=0;a<results.length;a++){
					console.log(results[a]);
				}
			
			}
			recognition.start();
		}
	}

		Main.init();
	})();


