import React from "react";
import Card from "../../../components/shared/Card/Card";
import Button from "../../../components/shared/Button/Button";
import styles from "./StepAvatar.module.css";
import { useSelector,useDispatch } from "react-redux";
import { useState } from "react";
import { setAvatar } from "../../../store/activateSlice";
import { activate } from "../../../http";
import {setAuth} from '../../../store/authSlice';
import Loader from "../../../components/shared/Loader/Loader";
import { useEffect } from "react";

const StepAvatar = ({onNext})=>{
    const {name,avatar} = useSelector((state)=>state.activate);
    const dispatch = useDispatch();
    const [image,setImage] = useState('/images/monkey-avatar.png');
    const [loading,setLoading] = useState(false);
    
    function captureImage(e){
        const file = e.target.files[0];
        // inbuilt browser api's
        // file format converted into base64 string and that string will pass into source attribute
        
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = function(){
            setImage(reader.result);
            dispatch(setAvatar(reader.result));
            console.log(reader.result);
        }
    }
    async function submit(){

        if(!name || !avatar) return;
        
        try{
            const {data} = await activate({name,avatar})
            if(data.auth){
                
                    dispatch(setAuth(data));
                                
              }
            console.log(data);
        }catch(err){
            console.log(err);
        }finally{
            setLoading(false);
        }
    }
    
    if(loading) return <Loader message={"Activation in progress"}/>
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
            <input 
            onChange={captureImage}
            id="avatarInput" 
            type="file" 
            className={styles.avatarInput} />
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
