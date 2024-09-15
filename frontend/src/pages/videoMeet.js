import CallEndIcon from '@mui/icons-material/CallEnd';
import ChatIcon from '@mui/icons-material/Chat';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import { Badge, Button, IconButton, TextField } from '@mui/material';
import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import server from '../environment';
import "../style/videoComponent.css";




const server_url =`${server}`;

var connections = {};

const peerConfigConnections = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};



function VideoMeet() {
  var socketRef = useRef(); // direct socket address
  let socketIdRef = useRef(); // your socket ID
  let localVideoRef = useRef();
  

  let [videoAvailable, setVideoAvailable] = useState(true);
  let [audioAvailable, setAudioAvailable] = useState(true);
  let [video, setVideo] = useState([]); // Video handling
  let [audio, setAudio] = useState(); // Audio handling
  let [screen, setScreen] = useState(); // Share screen
  let [showModal, setModal] = useState(true);
  let [screenAvailable, setScreenAvailable] = useState(); // Check if screen sharing is available
  let [messages, setMessages] = useState([]); // Message handling
  let [message, setMessage] = useState(""); // Message input
  let [newMessages, setNewMessages] = useState(3); // Alerts
  let [askForUsername, setAskForUsername] = useState(true); // Ask guest for login
  let [username, setUsername] = useState("");
  const videoRef = useRef([]); // References for video streams
  let [videos, setVideos] = useState([]);




  // Function to get video, audio, and screen permissions
  const getPermissions = async () => {
    try {
      const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoPermission) {
        setVideoAvailable(true);
        console.log("Video permission granted");
      } else {
        setVideoAvailable(false);
        console.log("Video permission denied");
      }

      const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (audioPermission) {
        setAudioAvailable(true);
        console.log("Audio permission granted");
      } else {
        setAudioAvailable(false);
        console.log("Audio permission denied");
      }

      if (navigator.mediaDevices.getDisplayMedia) {
        setScreenAvailable(true);
      } else {
        setScreenAvailable(false);
      }

      if (videoAvailable || audioAvailable) {
        const userMediaStream = await navigator.mediaDevices.getUserMedia({
          video: videoAvailable,
          audio: audioAvailable,
        });
        if (userMediaStream) {
          window.localStream = userMediaStream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = userMediaStream;
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getPermissions();
  }, []);

  let getUserMediaSuccess = (stream) => {
    // handle user media server
    try {
        window.localStream.getTracks().forEach(track => track.stop())
    } catch (e) { console.log(e) }

    window.localStream = stream
    localVideoRef.current.srcObject = stream

    for (let id in connections) {
        if (id === socketIdRef.current) continue

        connections[id].addStream(window.localStream)

        connections[id].createOffer().then((description) => {
            console.log(description)
            connections[id].setLocalDescription(description)
                .then(() => {
                    socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                })
                .catch(e => console.log(e))
        })
    }

    stream.getTracks().forEach(track => track.onended = () => {
        setVideo(false);
        setAudio(false);

        try {
            let tracks = localVideoRef.current.srcObject.getTracks()
            tracks.forEach(track => track.stop())
        } catch (e) { console.log(e) }

        let blackSilence = (...args) => new MediaStream([black(...args), silence()])
        window.localStream = blackSilence()
        localVideoRef.current.srcObject = window.localStream

        for (let id in connections) {
            connections[id].addStream(window.localStream)

            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                    })
                    .catch(e => console.log(e))
            })
        }
    })
}
let silence = () => {
  let ctx = new AudioContext()
  let oscillator = ctx.createOscillator()
  let dst = oscillator.connect(ctx.createMediaStreamDestination())
  oscillator.start()
  ctx.resume()
  return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
}

let black = ({ width = 640, height = 480 } = {}) => {
  let canvas = Object.assign(document.createElement("canvas"), { width, height })
  canvas.getContext('2d').fillRect(0, 0, width, height)
  let stream = canvas.captureStream()
  return Object.assign(stream.getVideoTracks()[0], { enabled: false })
}



//handlers
let handleVideo = () => {
  setVideo(!video);
  
}
let handleAudio = () => {
  setAudio(!audio)
}
  let getDislayMediaSuccess = (stream) =>{
    try {
      window.localStream.getTracks().forEach(track => track.stop())
  } catch (e) { console.log(e) }
  window.localStream = stream
  localVideoRef.current.srcObject = stream
  for (let id in connections) {
    if (id === socketIdRef.current) continue

    connections[id].addStream(window.localStream)

    connections[id].createOffer().then((description) => {
        connections[id].setLocalDescription(description)
            .then(() => {
                socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
            })
            .catch(e => console.log(e))
    })
}
stream.getTracks().forEach(track => track.onended = () => {
  setScreen(false)

  try {
      let tracks = localVideoRef.current.srcObject.getTracks()
      tracks.forEach(track => track.stop())
  } catch (e) { console.log(e) }

  let blackSilence = (...args) => new MediaStream([black(...args), silence()])
  window.localStream = blackSilence()
  localVideoRef.current.srcObject = window.localStream

  getUserMedia()
})
};

let getDislayMedia = () => {
  if (screen) {
      if (navigator.mediaDevices.getDisplayMedia) {
          navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
              .then(getDislayMediaSuccess)
              .then((stream) => { })
              .catch((e) => console.log(e))
      }
  }
}
useEffect(() => {
  if (screen !== undefined) {
      getDislayMedia();
  }
}, [screen])

let handleScreen = () => {
  setScreen(!screen);
}
  let handleEndCall = () => {
        try {
            let tracks = localVideoRef.current.srcObject.getTracks()
            tracks.forEach(track => track.stop())
        } catch (e) { }
        window.location.href = "/home"
    }


    let sendMessage = () => {
      console.log(socketRef.current);
      socketRef.current.emit('chat-message', message, username)
      setMessage("");

      // this.setState({ message: "", sender: username })
  }


  // Function to get user media (camera and audio)
  let getUserMedia = () => {
    if ((video && videoAvailable) || (audio && audioAvailable)) {
      navigator.mediaDevices
        .getUserMedia({ video: video, audio: audio })
        .then(getUserMediaSuccess)
        .then((stream) => {})
        .catch((e) => console.log(e));
    } else {
      try {
        let tracks = localVideoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      } catch (e) {}
    }
  };

  useEffect(() => {
    if (video !== undefined && audio !== undefined) {
      getUserMedia();
      console.log("SET STATE HAS ", video, audio);
    }
  }, [video, audio]);

  let getMedia = () => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);
    connectToSocketServer();
  };

  let gotMessageFromServer = (fromId, message) => {
    //handle message from the server
    var signal = JSON.parse(message)

    if (fromId !== socketIdRef.current) {
        if (signal.sdp) {
            connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
                if (signal.sdp.type === 'offer') {
                    connections[fromId].createAnswer().then((description) => {
                        connections[fromId].setLocalDescription(description).then(() => {
                            socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': connections[fromId].localDescription }))
                        }).catch(e => console.log(e))
                    }).catch(e => console.log(e))
                }
            }).catch(e => console.log(e))
        }

        if (signal.ice) {
            connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e))
        }
    }
}

  let addMessage = (data,sender,socketIdSender) => {
    // Handle message addition
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: sender, data: data }
  ]);


  if (socketIdSender !== socketIdRef.current) {
      setNewMessages((prevNewMessages) => prevNewMessages + 1);
  }
  };
  let connectToSocketServer = () => {
    socketRef.current = io.connect(server_url, { secure: false })

    socketRef.current.on('signal', gotMessageFromServer)

    socketRef.current.on('connect', () => {
        socketRef.current.emit('join-call', window.location.href)
        socketIdRef.current = socketRef.current.id

        socketRef.current.on('chat-message', addMessage)

        socketRef.current.on('user-left', (id) => {
            setVideos((videos) => videos.filter((video) => video.socketId !== id))
        })

        socketRef.current.on('user-joined', (id, clients) => {
            clients.forEach((socketListId) => {

                connections[socketListId] = new RTCPeerConnection(peerConfigConnections)
                // Wait for their ice candidate       
                connections[socketListId].onicecandidate = function (event) {
                    if (event.candidate != null) {
                        socketRef.current.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }))
                    }
                }

                // Wait for their video stream
                connections[socketListId].onaddstream = (event) => {
                    console.log("BEFORE:", videoRef.current);
                    console.log("FINDING ID: ", socketListId);

                    let videoExists = videoRef.current.find(video => video.socketId === socketListId);

                    if (videoExists) {
                        console.log("FOUND EXISTING");

                        // Update the stream of the existing video
                        setVideos(videos => {
                            const updatedVideos = videos.map(video =>
                                video.socketId === socketListId ? { ...video, stream: event.stream } : video
                            );
                            videoRef.current = updatedVideos;
                            return updatedVideos;
                        });
                    } else {
                        // Create a new video
                        console.log("CREATING NEW");
                        let newVideo = {
                            socketId: socketListId,
                            stream: event.stream,
                            autoplay: true,
                            playsinline: true
                        };

                        setVideos(videos => {
                            const updatedVideos = [...videos, newVideo];
                            videoRef.current = updatedVideos;
                            return updatedVideos;
                        });
                    }
                };


                // Add the local video stream
                if (window.localStream !== undefined && window.localStream !== null) {
                    connections[socketListId].addStream(window.localStream)
                } else {
                    let blackSilence = (...args) => new MediaStream([black(...args), silence()])
                    window.localStream = blackSilence()
                    connections[socketListId].addStream(window.localStream)
                }
            })

            if (id === socketIdRef.current) {
                for (let id2 in connections) {
                    if (id2 === socketIdRef.current) continue

                    try {
                        connections[id2].addStream(window.localStream)
                    } catch (e) { }

                    connections[id2].createOffer().then((description) => {
                        connections[id2].setLocalDescription(description)
                            .then(() => {
                                socketRef.current.emit('signal', id2, JSON.stringify({ 'sdp': connections[id2].localDescription }))
                            })
                            .catch(e => console.log(e))
                    })
                }
            }
        })
    })
}


  let connect = () => {
    setAskForUsername(false);
    getMedia();
  };

  return (
    <div>
      {askForUsername === true ? 
        <div>
          <h2>Enter The Lobby</h2>
          <TextField
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            variant="outlined"
          />
          <Button variant="contained" onClick={connect}>
            Connect
          </Button>

          <div>
            <video ref={localVideoRef} autoPlay muted></video>
          </div>
        </div> :


<div className = 'meetVideoContainer'>

{showModal ? <div className='chatRoom'>

<div className='chatContainer'>

    <h1>Chat</h1>

    <div className='chattingDisplay'>

        {messages.length !== 0 ? messages.map((item, index) => {

            //console.log(messages)
            return (
                <div style={{ marginBottom: "20px" }} key={index}>
                    <p style={{ fontWeight: "bold" }}>{item.sender}</p>
                    <p>{item.data}</p>
                </div>
            )
        }) : <p>No Messages Yet</p>}


    </div>

    <div className='chattingArea'>
        <TextField value={message} onChange={(e) => setMessage(e.target.value)} id="outlined-basic" label="Enter Your chat" variant="outlined" />
        <Button variant='contained' style={{marginBottom:'4px',marginTop:'5px'}} onClick={sendMessage}>Send</Button>
    </div>


</div>
</div> : <></>}

         

          <div className="buttonContainer">
 {/*video  */}
<IconButton onClick={handleVideo}  style={{color:"white"}}>
{(video===true) ? <VideocamIcon /> :<VideocamOffIcon/> }
</IconButton>

 {/* mic */}
<IconButton onClick={handleAudio} style={{color:"white"}}>
  {audio === true ? <MicIcon/> :<MicOffIcon/>}
</IconButton>
{/* callb */}
<IconButton  onClick = {handleEndCall} style =  {{color:'red'}}>
  <CallEndIcon/>
 </IconButton>

{/* screenS */}
{screenAvailable === true ?
<IconButton onClick={handleScreen} style={{ color: "white" }}>
{screen === true ? <ScreenShareIcon /> : <StopScreenShareIcon />}
</IconButton> : <></>}
{/* messF */}
<Badge badgeContent={newMessages} max={999} color='secondary'>
<IconButton onClick={() => setModal(!showModal)} style={{ color: "white" }}>
<ChatIcon /></IconButton>
</Badge>

          </div>
        
          <video className="meetUserVideo" ref={localVideoRef} autoPlay muted></video>
          <div className='conferenceView' >
          {videos.map((video) => (
            <div  key = {video.socketId}>
              
              <video
  data-socket={video.socketId}
  ref={(ref) => {
    if (ref && video.stream) {
      ref.srcObject = video.stream;
    }
  }}
  autoPlay // Corrected to autoPlay
>


              </video>


            </div>
          ))}
          </div>
            
              


        </div>
      }
    </div>
);

}

export default VideoMeet;
