import React from "react";
import Phone from "./Phone/Phone";
import Email from "./Email/Email";
import { useState } from "react";
import Card from "../../../components/shared/Card/Card";
import styles from "./StepPhoneEmail.module.css";
const phoneEmailMap = {
    phone: Phone,
    email: Email, 
}
const StepPhoneEmail = ({onNext})=>{
    const [toggle,setToggle] = useState('phone');
    const Component = phoneEmailMap[toggle];
    
    return (
        <div>
            <div className={styles.cardWrapper}>
                <div>
                <div className={styles.buttonWrap}>
                    <button className={`${styles.tabButton} ${toggle==='phone'?styles.active:''}`} onClick={()=>setToggle('phone')}>
                        <img src="/images/mobile vector.png" alt="mobile" />
                    </button>
                    <button  className={`${styles.tabButton} ${toggle==='email'?styles.active:''}`} onClick={()=>setToggle('email')}>
                    <img src="/images/email vector.png" alt="email" />
                    </button>
                </div>
                <Component onNext={onNext}/>
                </div>
               
                
            </div>
        </div>
    )
}
export default StepPhoneEmail;
<Card heading="Enter your Phone no." icon="telephone"/>