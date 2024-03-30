import React from "react";
import styles from './Card.module.css';

const Card = ({heading,icon,children})=>{
    return (
        <div className={styles.card}>
    <div className={styles.headWrapper}>
        <img src={`/images/${icon}.png`} alt="logo" />
        <h1 className={styles.heading}>{heading}</h1>
    </div>
    {children}

</div>
    )
}
export default Card;