import React, { useState } from "react";
import Button from "../../../../components/shared/Button/Button";
import Card from "../../../../components/shared/Card/Card";
import TextInput from "../../../../components/shared/TextInput/TextInput";
import styles from '../StepPhoneEmail.module.css'
import {findUser} from "../../../../http/index";
import { sendOtpEmail } from "../../../../http/index";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch } from "react-redux";
import { setOtp,setAuth } from "../../../../store/authSlice";
import { loginEmail,googleLogin } from "../../../../http/index";
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const Email = ({onNext})=>{
    const [email,setEmail] = useState('');
    const [password,setPassword] = useState('');
    const dispatch = useDispatch();
    const responseGoogle = async (response) => {
        try {
            const { data } = await googleLogin({ token: response.credential });
            dispatch(setAuth(data));
        } catch (error) {
            toast.error('Google login failed why');
        }
    };

    async function submit(){
        // server request
       
        if(!email || !password){
            toast.error('Both fields required', {
                position: "bottom-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: 1,
                theme: "dark",
                });
            console.log("email and password enter");
            return;
        }
        const {data} = await findUser({email:email,password:password});
        console.log(data);
        if(!data.user){
            // create new user and send otp
            // logic to send otp from email
            const {data} = await sendOtpEmail({email:email});
            console.log(data);
            dispatch(setOtp({email:email,hash: data.hash,password:password}));
            onNext();
        }else if (data.user && data.isValid===false){
            toast.error("Incorrect Password");
        }else{
            const {data} = await loginEmail({email:email});
            dispatch(setAuth(data));
        }
        // dispatch(setOtp({phone:data.phone,hash: data.hash}))
        
    }

    return (
        <div>
            <Card heading={"Enter your Email"} icon={"email emoji"}>
            <TextInput placeholder={"Enter your email id"} value={email} onChange={(event)=>{
                setEmail(event.target.value)
            }}/>
            <br />
            <TextInput placeholder={"Enter your pasword"} type = "password" value={password} onChange={(event)=>{
                setPassword(event.target.value)
            }}/>
             <div>
            <div className={styles.actionButtonWrap}>
            <Button text={"Next"} logo={"/images/Vector (1).png"} onClick={submit} />
            </div>
            <p className={styles.bottomPara}>
                By entering your number, you agree to our terms and conditions.Thanks!
            </p>
                 <GoogleOAuthProvider clientId="666111852320-5sj0b6062nugsnud81uqd2eglomlri15.apps.googleusercontent.com">
                        <GoogleLogin
                            onSuccess={responseGoogle}
                            onError={() => {
                                toast.error('Google login failed');
                            }}
                            theme="outline"
                            text="Continue with Google"
                        />
                    </GoogleOAuthProvider>
            </div>
            
         </Card>
        </div>
    )
}
export default Email;
