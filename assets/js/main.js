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
          "YouTube": ["ChatMessage"]
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
    usersToIgnore: ['ZoidepombaReal', 'StreamElements']
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

  const _createChatItem = (user, message, platform, color) => {
    const chatItem = document.createElement('div')
    const platformConfig = _getPlatformConfig(platform.toLowerCase())
    chatItem.classList.add('chat__item')
    chatItem.classList.add(platform.toLowerCase())
    chatItem.style.transform = 'translateY(20px)';
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
      chatItens[chatItens.length - 1].remove();
    }
  }

  const _load = (config) => {
    _chatContainer = document.querySelector('.chat')
    const websocket = _subscribeWebSocket(config.websocketAddress)
    
    websocket.onmessage = (message) => {
      if(message){
        const wsData = JSON.parse(message.data);
        console.log(wsData)
        if(wsData.event){
          const data = wsData.data.message
          if(!config.usersToIgnore.includes(data.displayName)){
            let chatMessage = _createChatItem(
                data.displayName, 
                data.message, 
                wsData.event.source,
                data.color)
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

streamerBotChatOverlay.load({
  maxMessages: 10,
  websocketAddress: 'ws://192.168.200.114:8080',
  usersToIgnore: ['ZoidePombaReal', 'StreamElements']
})