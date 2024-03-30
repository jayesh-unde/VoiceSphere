import React from "react";
import Card from "../../../components/shared/Card/Card";
import Button from "../../../components/shared/Button/Button";
import styles from "./StepAvatar.module.css";
import { useSelector } from "react-redux";
import { useState } from "react";

const StepAvatar = ({onNext})=>{
    const {name} = useSelector((state)=>state.activate);
    const [image,setImage] = useState('/images/monkey-avatar.png');
    function submit(){

    }
    return (
        <div className={styles.cardWrapper}>
        <Card heading={`Hello, ${name}`} icon={"monkey-emoji"}>

        <p className={styles.subheading}>How's this photo</p>
        <div className={styles.avatarWrapper}>
            <img 
            className={styles.avatarImage}
            src={image} alt="avatar" />
        </div>
        <div>
            <input id="avatarInput" type="file" className={styles.avatarInput} />
            <label className={styles.avatarLabel} htmlFor="avatarInput">
                Choose a different Photo
            </label>
        </div>
        <div className={styles.actionButtonWrap}>
        <Button text={"Next"} logo={"/images/Vector (1).png"} onClick={submit}/>
        </div>
        
        
     </Card>
    </div>
        
    )
}
export default StepAvatar