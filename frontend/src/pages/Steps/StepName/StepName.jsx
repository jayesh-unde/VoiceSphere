import React from "react";
import Card from "../../../components/shared/Card/Card";
import Button from "../../../components/shared/Button/Button";
import TextInput from "../../../components/shared/TextInput/TextInput";
import styles from "./StepName.module.css";
import { useState } from "react";
import { useDispatch,useSelector } from "react-redux";
import { setName } from "../../../store/activateSlice";

const StepName = ({onNext})=>{
    const {name} = useSelector(state=> state.activate);
    const dispatch = useDispatch();
    const [fullname,setfullName] = useState(name);  
    // default set as name instead of empty string because if we return from stepavaatar page then we dont' need to write the name again
    function nextStep(){
        if(!fullname){
            return;
        }
        dispatch(setName(fullname)); // stored in local state
        onNext();
    }
    return (
        <div className={styles.cardWrapper}>
            <Card heading={"Enter your full Name"} icon={"goggle-emoji"}>
            <div>
            <TextInput 
                value={fullname} 
                onChange={(event)=>{
                setfullName(event.target.value)
            }}/>
            </div>
            
             
             <div>
             <p className={styles.paragraph}>
                People use real name at VoiceSphere :) !
            </p>
            <div className={styles.actionButtonWrap}>
            <Button text={"Next"} logo={"/images/Vector (1).png"} onClick={nextStep}/>
            </div>
            
            </div>
            
         </Card>
        </div>
        
    )
}
export default StepName