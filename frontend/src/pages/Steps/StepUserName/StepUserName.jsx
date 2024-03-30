import React from "react";
const StepUserName = ({onNext})=>{
    return (
        <div>
            <div>StepName component</div>
            <button onClick={onNext}>Next</button>
        </div>
        
    )
}
export default StepUserName