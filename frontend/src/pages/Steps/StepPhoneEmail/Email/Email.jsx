import React, { useState } from "react";
import Button from "../../../../components/shared/Button/Button";
import Card from "../../../../components/shared/Card/Card";
import TextInput from "../../../../components/shared/TextInput/TextInput";
import styles from '../StepPhoneEmail.module.css'

const Email = ({onNext})=>{
    const [email,setEmail] = useState('');
    return (
        <div>
            <Card heading={"Enter your Email"} icon={"email emoji"}>
            <TextInput value={email} onChange={(event)=>{
                setEmail(event.target.value)
            }}/>
             <div>
            <div className={styles.actionButtonWrap}>
            <Button text={"Next"} logo={"/images/Vector (1).png"} onClick={onNext} />
            </div>
            <p className={styles.bottomPara}>
                By entering your number, you agree to our terms and conditions.Thanks!
            </p>
            </div>
            
         </Card>
        </div>
    )
}
export default Email;