import React from "react";
import Card from "../../../../components/shared/Card/Card";
import Button from "../../../../components/shared/Button/Button";
import TextInput from "../../../../components/shared/TextInput/TextInput";
import { useState } from "react";
import styles from '../StepPhoneEmail.module.css'
import { sendOtp } from "../../../../http/index";
import { useDispatch } from "react-redux";
import { setOtp } from "../../../../store/authSlice";

const Phone = ({onNext})=>{
    const [phoneNumber,setPhoneNumber] = useState('');
    
    const dispatch = useDispatch();

    async function submit(){
        // server request
        if(!phoneNumber) return;
        const {data} = await sendOtp({phone:phoneNumber});
        console.log(data);
        dispatch(setOtp({phone:data.phone,hash: data.hash}));
        onNext();
    }
    return (
        
        <Card heading={"Enter your Phone"} icon={"telephone"}>
            <div>
            <TextInput value={phoneNumber} onChange={(event)=>{
                setPhoneNumber(event.target.value)
            }}/>
            </div>
            
             
             <div>
            <div className={styles.actionButtonWrap}>
            <Button text={"Next"} logo={"/images/Vector (1).png"} onClick={submit} />
            </div>
            <p className={styles.bottomPara}>
                By entering your number, you agree to our terms and conditions.Thanks!
            </p>
            </div>
            
         </Card>
        

    )
}
export default Phone;