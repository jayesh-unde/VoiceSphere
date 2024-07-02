import React from "react";
import styles from './Button.module.css';

const Button = ({text,logo,onClick})=>{
    return(
        <button onClick={onClick} className={styles.button}>
            <span>{text}</span>
            <img className={styles.arrow} src={logo} alt="" />
        </button>
    )
}
export default Button;