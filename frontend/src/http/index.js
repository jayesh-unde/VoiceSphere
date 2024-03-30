// all endpoints html requests will be stored in this file and exported wherever needed all 
// urls will be in this file making it easy for future to change anything only in this file

import axios from 'axios';

const api = axios.create(
    {
        withCredentials:true,
        baseURL:process.env.REACT_APP_API_URL,
        headers:{
            'Content-Type':'application/json',
            Accept: 'application/json',
        }
    }
);

//list of all endpoints

export const sendOtp = (data)=>api.post('/api/send-otp',data);
export const verifyOtp = (data)=>api.post('/api/verify-otp',data);
export default api;