/**
 * Variables
 */

let chatName = ''
let chatSocket = ''
let chatWindowUrl = window.location.href
let chatRoomUuid = Math.random().toString(36).slice(2, 12)


/**
 * Elements
 */

const chatElement = document.querySelector('#chat')
const chatOpenElement = document.querySelector('#chat_open')
const chatJoinElement = document.querySelector('#chat_join')
const chatIconElement = document.querySelector('#chat_icon')
const chatWelcomeElement = document.querySelector('#chat_welcome')
const chatRoomElement = document.querySelector('#chat_room')
const chatNameElement = document.querySelector('#chat_name')
const chatLogElement = document.querySelector('#chat_log')
const chatInputElement = document.querySelector('#chat_message_input')
const chatSubmitElement = document.querySelector('#chat_message_submit')


/**
 * Functions
 */

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}


function sendMessage() {
    const messageData = {
        'type': 'message',
        'message': chatInputElement.value,
        'name': chatName
    };
    try {
        chatSocket.send(JSON.stringify(messageData));
        chatInputElement.value = '';
        console.log('messageData:', messageData);

    } catch (error) {
        console.log('Error sending message:', error);
    }
}

function onChatMessage(data) {
    console.log('onChatMessage', data)

    if (data.type == 'chat_message') {
        if (data.agent) {
            chatLogElement.innerHTML += `
                <div class="flex w-full mt-2 space-x-3 max-w-md">
                    <div class="flex-shrink-0 h-10 w-10 rounded-full bg-gray-300 text-center pt-2">${data.initials}</div>
                    <div>
                        <div class="bg-gray-100 p-3 rounded-l-lg rounded-br-lg"> 
                            <p class="text-sm">${data.message}</p>
                        </div>
                        <span class="text-xs text-gray-500 leading-none">${data.created_at} ago</span>
                    </div>
                </div>
            `

        } else {
            console.log('else', data)

            chatLogElement.innerHTML += `
                <div class="flex w-full mt-2 space-x-3 max-w-md ml-auto justify-end">
                    <div>
                        <div class="bg-emerald-100 p-3 rounded-l-lg rounded-br-lg"> 
                            <p class="text-sm">${data.message}</p>
                        </div>
                        <span class="text-xs text-gray-500 leading-none">${data.created_at} ago</span>
                    </div>
                    <div class="flex-shrink-0 h-10 w-10 rounded-full bg-gray-300 text-center pt-2">${data.initials}</div>
                </div>
            `
        }
    }
}

async function joinChatRoom() {
    console.log('joinChatRoom')

    chatName = chatNameElement.value

    console.log('Join as :', chatName)
    console.log('Room Id :', chatRoomUuid)

    const data = new FormData();
    data.append('name', chatName)
    data.append('url', chatWindowUrl)

    await fetch(`/api/create-room/${chatRoomUuid}/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken'),
            'Content-Type': 'application/x-www-form-urlencoded' // or 'multipart/form-data', depending on your backend
        },
        body: data
    })
        .then(function (res) {
            return res.json()
        })
        .then(function (data) {
            console.log('data:', data)
        })

    chatSocket = new WebSocket(`ws://${window.location.host}/ws/${chatRoomUuid}/`)

    chatSocket.onmessage = function (e) {
        console.log('onMessage')

        onChatMessage(JSON.parse(e.data))
    }

    chatSocket.onopen = function (e) {
        console.log('onOpen - chat socket was opened')
    }
    chatSocket.onclose = function (e) {
        console.log('onClose - chat socket was closed')
    }
}

/**
 * Event listeners
 */
chatOpenElement.onclick = function (e) {
    e.preventDefault()

    chatIconElement.classList.add('hidden')
    chatWelcomeElement.classList.remove('hidden')

    return false
}

chatJoinElement.onclick = function (e) {
    e.preventDefault()

    chatWelcomeElement.classList.add('hidden')
    chatRoomElement.classList.remove('hidden')

    console.log("yes joining")
    joinChatRoom()

    return false
}

chatSubmitElement.onclick = function (e) {
    e.preventDefault()

    sendMessage()

    return false

}