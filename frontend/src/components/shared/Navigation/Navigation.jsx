import React from "react";
import {Link} from 'react-router-dom';
import styles from './Navigation.module.css';

const Navigation = ()=>{
    // inline CSS
    const brandStyle = {
        color: '#fff',
        textDecoration: 'none',
        fontWeight: 'bold',
        fontSize: '22px',
        display: 'flex',
        alignItems: 'center',
    }
    const logoText = {
        marginLeft:'10px',
    }
    return(
        // variable style used here
        <nav className={`${styles.navbar} container`}> 
            <Link style={brandStyle} to="/">
            <img src="/images/Hi.png" alt="logo" />
            <span style={logoText}>VoiceSphere</span>
            </Link>
        </nav>
    )
}
export default Navigation;