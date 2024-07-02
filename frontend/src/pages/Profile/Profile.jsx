import React from 'react';
import { useSelector } from 'react-redux';
import styles from "./Profile.module.css";
import Button from '../../components/shared/Button/Button';

const Profile = () => {
    const { user } = useSelector((state) => state.auth);

    return (
        <>
            <div className={styles.container}>
                <div className={styles.box}>
                    <div className={styles.avatar}>
                        <img src={user.avatar} alt="" />
                    </div>
                    <div className={styles.profileDetails}>
                        <div className={styles.name}>
                            <h1>{user.name}</h1>
                        </div>
                        <div className={styles.about}>
                            <p>Web Developer</p>
                            <p>Lives in New York</p>
                            <p>Podcaster</p>
                        </div>
                        <div className={styles.stats}>
                            <div className={styles.statItem}>
                                <span>Podcasts</span>
                                <span>100</span>
                            </div>
                            <div className={styles.statItem}>
                                <span>Followers</span>
                                <span>1026</span>
                            </div>
                            <div className={styles.statItem}>
                                <span>Following</span>
                                <span>478</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={styles.actions}>
                    <Button text="Follow" />
                    <Button text="Message" />
                </div>
            </div>
        </>
    );
}

export default Profile;
