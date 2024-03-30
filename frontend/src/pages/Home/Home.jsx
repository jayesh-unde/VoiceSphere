import React from "react";
import styles from './Home.module.css';
import {useNavigate} from 'react-router-dom';
import Card from "../../components/shared/Card/Card";
import Button from "../../components/shared/Button/Button"

const Home=()=>{
    //inline style element for Link component
    
    const navigate = useNavigate();
    function startRegister(){
        navigate('/authenticate');
        // console.log("button clicked");
    }
    return(
        <div className={styles.cardWrapper}>
            <Card heading="Welcome to VoiceSphere !" icon="Hi">  
            <p className={styles.text}>
                We're putting the finishing touches on VoiceSphere, 
                your go-to platform for lively live audio chats! 
                To ensure everything runs smoothly, we're inviting users in stages.
                Get ready to join a community where your voice matters, conversations thrive,
                and connections come to life in real-time. Stay tuned for the big launch!
                </p>
                <div>
                   <Button onClick={startRegister} text={"Let's go"} logo={"/images/Vector (1).png"}/>
                </div>
                <div className={styles.signinWrapper}>
                    <span className={styles.invite}>Have an invite text</span>
                </div>
            
            </Card>
                
            
        </div>
    )
        
    
}
export default Home;