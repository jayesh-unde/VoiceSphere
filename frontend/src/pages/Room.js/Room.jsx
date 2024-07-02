import React, { Children } from "react";
import styles from "./Room.module.css";
import { useState, useEffect } from "react";
import { useWebRTC } from "../../hooks/useWebRTC";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getRoom,leaveRoom } from "../../http/index";

const Room = () => {
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const { id: roomId } = useParams();
  const user = useSelector((state) => state.auth.user);
  const { clients, provideRef, handleMute } = useWebRTC(roomId, user);
  const [isMuted, setMuted] = useState(false);

  const handleMuteClick = (clientId) => {
    if (clientId !== user.id) {
      return;
    }
    setMuted((prev) => !prev);
  };

  useEffect(() => {
    handleMute(isMuted, user.id);
  }, [isMuted]);

  useEffect(() => {
    const fetchRoom = async () => {
      const { data } = await getRoom(roomId);
      setRoom((prev) => data);
    };

    fetchRoom();
  }, [roomId]);

  const handManualLeave = async () => {
    
    navigate("/rooms");
    await leaveRoom({userId:user.id,roomId});
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
        <img src="/images/vector.png" alt="copy-icon"  style={{ width: '20px', height: '20px' }}/>
        <span>Copy Link</span>
      </button>
            <button className={styles.actionBtn}>
              <img src="/images/palm.png" alt="palm-icon" />
            </button>
            <button onClick={handManualLeave} className={styles.actionBtn}>
              <img src="/images/win.png" alt="win-icon" />
              <span>Leave quietly</span>
            </button>
          </div>
        </div>
        <div className={styles.clientsList}>
          {clients.map((client) => {
            return (
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
            );
          })}
        </div>
      </div>
    </>
  );
};
export default Room;
