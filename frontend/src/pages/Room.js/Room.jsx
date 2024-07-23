import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getRoom, leaveRoom } from "../../http/index";
import { useWebRTC } from "../../hooks/useWebRTC";
import socketInit from "../../socket";
import styles from "./Room.module.css";

const Room = () => {
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const { id: roomId } = useParams();
  const user = useSelector((state) => state.auth.user) || {}; // Ensure user is always defined
  const { clients, provideRef, handleMute } = useWebRTC(roomId, user);
  const [isMuted, setMuted] = useState(false);

  // Chat related state
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const socket = useRef(null);
  const messagesEndRef = useRef(null); // Ref for auto-scrolling

  const handleMuteClick = (clientId) => {
    if (clientId !== user.id) {
      return;
    }
    setMuted((prev) => !prev);
  };

  useEffect(() => {
    if (user.id) {
      handleMute(isMuted, user.id);
    }
  }, [isMuted, user.id]);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const { data } = await getRoom(roomId);
        setRoom(data);
      } catch (error) {
        console.error("Failed to fetch room:", error);
      }
    };
    fetchRoom();
  }, [roomId]);

  useEffect(() => {
    socket.current = socketInit();
    console.log("Socket initialized");

    // Listening for incoming messages
    socket.current.on('receiveMessage', ({ message, user }) => {
      console.log("Message received");
      setMessages(prevMessages => [...prevMessages, { message, user }]);
    });

    // Cleanup on unmount
    return () => {
      socket.current.off('receiveMessage');
    };
  }, []);

  useEffect(() => {
    // Scroll to the bottom of the chat box when a new message is added
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() !== "") {
      socket.current.emit('sendMessage', { roomId, message: newMessage, user });
      setMessages(prevMessages => [...prevMessages, { message: newMessage, user: 'You' }]);
      setNewMessage("");
    }
  };

  const handleManualLeave = async () => {
    try {
      await leaveRoom({ userId: user.id, roomId });
      navigate("/rooms");
    } catch (error) {
      console.error("Failed to leave room:", error);
    }
  };

  const copyLinkToClipboard = () => {
    const currentURL = window.location.href;
    navigator.clipboard.writeText(currentURL)
      .then(() => {
        alert('Link copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };

  return (
    <>
      <div className="container">
        <button
          onClick={() => {
            navigate("/rooms");
          }}
          className={styles.goBack}
        >
          <img src="/images/arrow-left.png" alt="arrow-left" />
          <span>All Voice Rooms</span>
        </button>
      </div>
      <div className={styles.clientsWrap}>
        <div className={styles.header}>
          {room && <h2 className={styles.topic}>{room.topic}</h2>}
          <div className={styles.actions}>
            <button onClick={copyLinkToClipboard} className={styles.actionBtn}>
              <img src="/images/vector.png" alt="copy-icon" style={{ width: '20px', height: '20px' }} />
              <span>Copy Link</span>
            </button>
            <button className={styles.actionBtn}>
              <img src="/images/palm.png" alt="palm-icon" />
            </button>
            <button onClick={handleManualLeave} className={styles.actionBtn}>
              <img src="/images/win.png" alt="win-icon" />
              <span>Leave quietly</span>
            </button>
          </div>
        </div>
        <div className={styles.mainContent}>
          <div className={styles.clientsList}>
            {clients.map((client) => (
              <div className={styles.userHead} key={client.id}>
                <audio
                  autoPlay
                  ref={(instance) => provideRef(instance, client.id)}
                />
                <img src={client.avatar} className={styles.userAvatar} alt="" />
                <h4>{client.name}</h4>
                <button
                  onClick={() => handleMuteClick(client.id)}
                  className={styles.micBtn}
                >
                  {client.muted ? (
                    <img
                      className={styles.mic}
                      src="/images/mic-mute.png"
                      alt="mic"
                    />
                  ) : (
                    <img
                      className={styles.micImg}
                      src="/images/mic.png"
                      alt="mic"
                    />
                  )}
                </button>
              </div>
            ))}
          </div>
          <div className={styles.chatContainer}>
            <div className={styles.chatBox}>
              <div className={styles.messages}>
                {messages.map((msg, index) => (
                  <div key={index} className={msg.user === 'You' ? styles.messageUser : styles.messageOther}>
                    <div className={styles.user}>{msg.user}</div>
                    {msg.message}
                  </div>
                ))}
                <div ref={messagesEndRef} /> {/* Empty div to act as scroll target */}
              </div>
              <div className={styles.inputBox}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className={styles.input}
                />
                <button onClick={handleSendMessage} className={styles.sendBtn}>
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Room;
