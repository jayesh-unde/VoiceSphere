import React, { useEffect, useState } from "react";
import styles from "./Rooms.module.css";
import RoomCard from "../../components/RoomCard/RoomCard";
import AddRoomModal from "../../components/AddRoomModal/AddRoomModal";
import { getAllRooms } from "../../http";

const Rooms = () => {
  const [showModal, setShowModal] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchRooms = async () => {
      const { data } = await getAllRooms();
      setRooms(data);
      setFilteredRooms(data); // Initialize filtered rooms with all rooms
    };
    fetchRooms();
  },[]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      performSearch();
    }
  };

  const performSearch = () => {
    if (searchQuery.trim() === "") {
      setFilteredRooms(rooms); // If search query is empty, show all rooms
    } else {
      const filtered = rooms.filter((room) =>
        room.topic.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredRooms(filtered);
    }
  };

  function openModal() {
    setShowModal(true);
  }

  return (
    <>
      <div className="container">
        <div className={styles.roomHeader}>
          <div className={styles.left}>
            <span className={styles.heading}>All Voice Rooms</span>
            <div className={styles.searchBox}>
              <img src="/images/search-icon.png" alt="search" />
              <input
                type="text"
                className={styles.searchInput}
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search by topic"
              />
            </div>
          </div>
          <div className={styles.right}>
            <button onClick={openModal} className={styles.startRoomButton}>
              <img src="/images/add-room-icon.png" alt="room" />
              <span>Start a Room</span>
            </button>
          </div>
        </div>
        <div className={styles.roomList}>
          {filteredRooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      </div>
      {showModal && <AddRoomModal onClose={() => setShowModal(false)} />}
    </>
  );
};

export default Rooms;
