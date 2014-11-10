(function(){
	var Main=window.Main=
	{
		CustomSearchControl:null,
		ImageSearch:null,
		lastTerm:'',
		lastSearchCollection:[],
		talkingToMe:false,
		learnMode:false,
		currentPictureIndex:0,
		currentPageIndex:0,
		myName:'sam',
		memory:{
			person:{}
		},
		weather:null,
		learn:{},
		init:function(){
			
			this.loadGoolge();
			document.addEventListener('DOMContentLoaded',this.onLoad.bind(this));
		},
		onLoad:function(){
			if(localStorage.getItem('BrainMemory'))this.memory = JSON.parse(localStorage.getItem('BrainMemory'));
			

		},
		loadGoolge:function(){
			google.load("search", "1");
			google.setOnLoadCallback(this.onSearchReady.bind(this));
		},
		onSearchReady:function(){
			
			this.CustomSearchControl = new google.search.CustomSearchControl();
			this.CustomSearchControl.draw('cse');
			this.ImageSearch = new google.search.ImageSearch();
			this.ImageSearch.setResultSetSize(8);
			this.ImageSearch.setSearchCompleteCallback(this, this.imageSearchComplete.bind(this), null);
			this.setupVoice();


		},
		imageSearchComplete:function(){
			this.lastSearchCollection  =this.ImageSearch.results;
			this.displayImages(this.ImageSearch.results);
		},
		setupVoice:function(){
			if (annyang) {
				var commands = {
					'Sam':function(){
						Main.talkingToMe=true;
						Main.showMessage('Yes. I\'m Listening');
					},
					'show me pictures of *term': function(term) { 
						if(term.charAt(1)==" " && term.charAt(3) ==" ")term=term.replace(/\s/g, "");
						Main.lastTerm = term;
						Main.currentPageIndex = 0;
						Main.showMessage('showing you ' + term);
						Main.ImageSearch.execute(term); 
					},
					'show me picture *number':function(number){
						var number = Main.wordsToNumbers(number)
						Main.currentPictureIndex = number-1;
						Main.showMessage('showing you picture '+number+' ('+Main.lastTerm+")");
						Main.displayImages([Main.lastSearchCollection[number-1]]);
					},
					'show me more pictures':function(){
						Main.showMessage('showing you more');
						Main.currentPageIndex++;
						Main.ImageSearch.gotoPage(Main.currentPageIndex); 
					},
					'go back to images':function(){
						Main.showMessage('showing you ' + Main.lastTerm);
						Main.displayImages(Main.lastSearchCollection);
					},
					'start learning':function(){
						Main.learnMode=true;
						Main.learn={};
						Main.showMessage('okay I\'m ready to learn');
					},
					'stop learning':function(){
						Main.learnMode=false;
						Main.showMessage('okay');
						if(!Main.memory[Main.learn.type])Main.memory[Main.learn.type] ={};
						Main.memory[Main.learn.type][Main.learn.name]=Main.learn;
						localStorage.setItem('BrainMemory', JSON.stringify(Main.memory));
						console.log(Main.memory);
					},
					'learn *type':function(type){
						Main.learn.type = type.toLowerCase();
						Main.showMessage('learning type ' + type);
						if(Main.learn.type=='person')Main.showMessage('Male or Female?');
					},
					'name is *name':function(name){
						if(name.charAt(1)==" " && name.charAt(3) ==" ")name=name.replace(/\s/g, "");
						Main.learn.name = name.toLowerCase();
						Main.showMessage('name is ' + name);
					},
					'male':function(){
						Main.learn.gender = 'male';
						Main.showMessage('gender is male');
					},
					'female':function(){
						Main.learn.gender = 'female';
						Main.showMessage('gender is female');
						
					},
					'*name is interested in *term':function(name,term){
						if(!Main.memory['person'][name]){
							Main.showMessage('Sorry, I don\'t know that person' );
							return;
						}
						if(!Main.memory['person'][name].interests)Main.memory['person'][name].interests=[];
						Main.memory['person'][name.toLowerCase()].interests.push(term);
						Main.showMessage('Okay, so '+name+' is interested in '+term);
						Main.updateMemory();						
					},
					'what did you learn':function(){
						var str ='I\'ve learnt a '+Main.learn.type+' called '+ Main.learn.name;
						for(var prop in Main.learn){
							if(prop !='type' && prop!='name')
							{
								str+='<br><br>'+prop+' is '+Main.learn[prop];
							}
						}
						Main.showMessage(str);

					},
					'Sam this is *name':function(name){
						Main.showMessage('Hi, '+name);
						
					},
					'remember picture':function(){
						Main.showMessage('picture remembered as '+Main.learn.name);
						Main.learn.picture = Main.lastSearchCollection[Main.currentPictureIndex].url;
					},
					'who is *name':function(name){
						if(name.charAt(1)==" " && name.charAt(3) ==" ")name=name.replace(/\s/g, "");
						var person =Main.memory['person'][name.toLowerCase()];
						if(person)
						{
							var str = 'this is '+name+'. ';
							Main.displayImages([{url:Main.memory['person'][name.toLowerCase()].picture}]);
							
							if(person.interests)
							{
								str+=name+" is interested in ";
								for(var a=0;a<person.interests.length;a++){
									if(a>0 && a<person.interests.length-1)str+=" , ";
									if(a>0 && a==person.interests.length-1)str+=" and ";
									var interest =person.interests[a];
									str+=interest;
								}

							}
							Main.showMessage(str);

						}
					},
					'what is *name':function(name){
						var item = Main.findByNmae(name);
						if(item)
						{
							Main.showMessage('this is '+name);
							Main.displayImages([{url:item.picture}]);
						}
					},
					'clear':function(){
						Main.showMessage('');
						var holder = document.getElementById('display');
						holder.innerHTML = "";
					},
					'sam what\'s the time':function(){
						var newDate = new Date();
						// newDate.setTime(unixtime*1000);
						
						Main.showMessage(Main.formatAMPM(newDate));
					},
					'sam what\'s the weather':function(){
						
						//Main.showMessage('let me check');
						Main.getWeather();
					}

				};

				annyang.addCommands(commands);

				annyang.setLanguage('en-GB');
				annyang.start();
			}

			//this.showMessage("I'm awake");
		},
		formatAMPM:function(date) {
			var hours = date.getHours();
			var minutes = date.getMinutes();
			var ampm = hours >= 12 ? 'pm' : 'am';
			hours = hours % 12;
			hours = hours ? hours : 12; 
			minutes = minutes < 10 ? '0'+minutes : minutes;
			var strTime = hours + ':' + minutes + ' ' + ampm;
			return strTime;
		},
		updateMemory:function(){
			localStorage.setItem('BrainMemory', JSON.stringify(Main.memory));
		},
		getWeather:function(term){
			var head =document.getElementsByTagName('head')[0];
			var jsonp= document.getElementById('jsonp');
			if(jsonp)head.removeChild(jsonp);
			jsonp = document.createElement('script');
			jsonp.src="http://api.openweathermap.org/data/2.5/weather?q=London,uk&callback=onData";

			head.appendChild(jsonp);

		},
		onSearchResult:function(data){
			this.weather=data;
			this.showMessage('the weather currently is '+this.weather.weather[0].description);
		},
		findByNmae:function(name){
			for(var type in Main.memory)
			{
				for(var n in Main.memory[type]){
					if(n == name.toLowerCase())
					{
						return Main.memory[type][n];
					}
				}
			}
		},
		displayImages:function(collection){
			var holder = document.getElementById('display');
			holder.innerHTML = "";
			for(var a=0;a<collection.length;a++){
				var li = document.createElement('LI');
				var img = document.createElement('IMG');
				img.src=collection[a].url;
				li.appendChild(img);
				holder.appendChild(li);
			}
		},
		showMessage:function(msg){
			var holder = document.getElementById('message');
			holder.innerHTML = 	msg;
			var msg = new SpeechSynthesisUtterance(msg);
			window.speechSynthesis.speak(msg);
		},
		wordsToNumbers:function(word){
			var words={
				1:['one',"1"],
				2:['two','to','2'],
				3:['three','3'],
				4:['four','4','for'],
				8:['eight','8','ate']
			};

			for(var number in words){
				for(var a=0;a< words[number].length;a++){
					if(word == words[number][a])
						return number;
				}
			}

			return 1;
		}

	};
	window.onData=function(data){
		Main.onSearchResult(data);
	}

	Main.init();
})();


