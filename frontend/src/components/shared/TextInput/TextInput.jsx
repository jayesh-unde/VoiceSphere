import React from "react";
import styles from './TextInput.module.css';

const TextInput = (props)=>{
    return(
        <div>
            <input 
            style={{
                width:props.fullwidth === 'true' ? '100%': 'inherit',
            }}
            className={styles.input} type={props.type || 'text'} {...props} />
        </div>
    )
}
export default TextInput;