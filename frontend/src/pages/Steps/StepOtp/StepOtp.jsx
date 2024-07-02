import React from "react";
import Card from "../../../components/shared/Card/Card";
import styles from "./StepOtp.module.css";
import TextInput from "../../../components/shared/TextInput/TextInput";
import { useState } from "react";
import Button from "../../../components/shared/Button/Button";
import { verifyOtp } from "../../../http";
import { useSelector } from "react-redux";
import { setAuth } from "../../../store/authSlice";
import {useDispatch} from "react-redux";

// we removed onNext because when isAuth will be true and activated is false it will
// automatically transfer us to activate component bcz of update in value in redux store
const StepOtp = ()=>{
    const [otp,setOtp] = useState('');
    const dispatch = useDispatch(); // used to dispatch or store value in redux
    const {email,hash,password} = useSelector((state)=> state.auth.otp) // used the redux store value using state
    async function submit(){
        if(!otp || !hash) return;
        try{
            const {data} = await verifyOtp({otp,email,hash,password});
            dispatch(setAuth(data));
            console.log(data);
        }catch(err){
            console.log(err);
        }
    }
    return (
        <div className={styles.cardWrapper}>
            <Card heading={"Enter OTP"} icon={"lock emoji"}>
            <div>
            <TextInput value={otp} onChange={(event)=>{
                setOtp(event.target.value)
            }}/>
            </div>
            
             
             <div>
             <p className={styles.bottomPara}>
                Didn't recieve? Tap to resend
            </p>
            <div className={styles.actionButtonWrap}>
            <Button text={"Next"} logo={"/images/Vector (1).png"} onClick={submit}/>
            </div>
            
            </div>
            
         </Card>
            
        </div>
        
    )
}
export default StepOtp