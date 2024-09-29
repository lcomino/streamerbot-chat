const streamerBotChatOverlay = (() => {      

  const _subscribeWebSocket = (websocketAddress)=> {
    const websocket = new WebSocket(websocketAddress || 'ws://127.0.0.1:8080')
    websocket.onopen = (event) => {
      console.log('Conectado ao Streamer.Bot!')

      const subscribeMessage = {
        "request": "Subscribe",
        "id": "123123123123",
        "events": {
          "Twitch": ["ChatMessage"],
          "YouTube": ["Message"]
        }
      };
      websocket.send(JSON.stringify(subscribeMessage))
    }
    return websocket;
  }
  
  let _chatContainer = '';
  let messages = []
  let config = {
    maxMessages: 10,
    websocketAddress: 'ws://127.0.0.1:8080',
    ignoredUsers: [],
    maxTime: 15
  }  

  const platformConfig = {
    "generic" : {
      logo: 'twitch.png',
      color: 'red'
    },
    "twitch" : {
      logo: 'twitch.png',
      color: '#6440a5'
    },
    "youtube" : {
      logo: 'youtube.png',
      color: '#ca1111'
    }
  }

  const _getPlatformConfig = (platform) => {
    return platformConfig[platform] || platformConfig['generic']
  }

  const _newMessage = (array, index) => {        
    const newMessage = array[index];
    _chatContainer.prepend(newMessage);
    requestAnimationFrame(() => {
      newMessage.style.opacity = 1;
      newMessage.style.transform = 'translateY(0)';
    });
    _chatContainer.scrollTop = _chatContainer.scrollHeight;
    if(array.length >= config.maxMessages){
      array.shift()          
      _removeFirstMessage()
    }
  }

  Object.defineProperty(messages, "push", {
    value: function () {
      for (var i = 0, n = this.length, l = arguments.length; i < l; i++, n++) {
        _newMessage(this, n, this[n] = arguments[i]);
      }
      return n;
    }
  });

  const _generateExpireTime = () => {
    const date = new Date()
    date.setSeconds(date.getSeconds()+config.maxTime)
    return date.getTime()
  }

  const _createChatItem = (user, message, platform, color) => {
    const chatItem = document.createElement('div')
    const platformConfig = _getPlatformConfig(platform.toLowerCase())
    chatItem.classList.add('chat__item')
    chatItem.classList.add(platform.toLowerCase())
    chatItem.style.transform = 'translateY(20px)';
    chatItem.setAttribute('data-max-time', _generateExpireTime())
    const chatUser = document.createElement('div')
    chatUser.classList.add('chat__user')
    chatUser.innerHTML = `<span class="platform-logo"></span> | <span class="chat__username" style="color:${color || platformConfig.color}">${user}</span>`
    const chatMessage = document.createElement('div')
    chatMessage.classList.add('chat__message')
    chatMessage.innerHTML = message;
    chatItem.appendChild(chatUser)
    chatItem.appendChild(chatMessage)

    return chatItem;
  }
  
  const _removeFirstMessage = () => {
    let chatItens = _chatContainer.querySelectorAll('.chat__item')
    if(chatItens.length > 0){
      //chatItens[chatItens.length - 1].remove();
      _removeChatElement(chatItens[chatItens.length - 1])
    }
  }

  const _removeChatElement = (chatElement) => {
    requestAnimationFrame(() => {
      chatElement.style.opacity = 0;
      chatElement.style.transform = 'translateY(-20px)';                      
    });
    setTimeout(() => { chatElement.remove() }, 500) 
  }

  const _removeExpiredMessages = () => {
    let chatItens = _chatContainer.querySelectorAll('.chat__item')
    if(chatItens.length > 0){
      Array.prototype.forEach.call(chatItens, (chatElement)=>{
        const chatMaxExpireTime = new Date(parseInt(chatElement.getAttribute('data-max-time')))
        const now = new Date()
        if(chatMaxExpireTime < now){
          _removeChatElement(chatElement)         
        }
      })
    }
  }

  const _getYoutubeUserColor = (userName) => {
    const selectedColor = config.usersColor.filter((user) => {
      return user.userName === userName
    })

    return selectedColor.length > 0 ? selectedColor[0].color : 'black'
    
  }

  const _getUserColor = (wsData) => {
    const color = wsData.event.source == 'Twitch' ? 
      wsData.data.message.color : 
      _getYoutubeUserColor(wsData.data.user.name) 
    return color;
  }

  const _startCheckOldMessages = () => {
    setInterval(_removeExpiredMessages, 1000)
  }

  

  const _load = (newConfig) => {
    config = newConfig
    _chatContainer = document.querySelector('.chat')
    const websocket = _subscribeWebSocket(config.websocketAddress)
    _startCheckOldMessages()
    websocket.onmessage = (message) => {
      if(message){
        const wsData = JSON.parse(message.data);
        console.log(wsData)
        if(wsData.event){
          const data = wsData.data.message
          const message = wsData.event.source == 'Twitch' ? wsData.data.message.message : wsData.data.message
          const color = _getUserColor(wsData)
          console.log(data)
          const userName = wsData.event.source == 'Twitch' ? data.displayName : wsData.data.user.name 
          if(!config.ignoredUsers.includes(userName)){
            let chatMessage = _createChatItem(
                userName, 
                message, 
                wsData.event.source,
                color)
            messages.push(chatMessage)
          }
        }
      }
    }
  }

  return {
    load : _load
  }
})()

fetch('config.json')
  .then(response => {
    if (!response.ok) {
      throw new Error('Erro ao carregar o arquivo de configuração.');
    }
    return response.json();
  })
  .then(config => {    
    streamerBotChatOverlay.load(config)
  })
  .catch(error => console.error('Erro:', error));