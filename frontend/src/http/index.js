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
export const activate = (data)=>api.post('/api/activate',data);
export const logout = ()=>api.post('/api/logout');
export const createRoom = (data)=>api.post('/api/rooms',data);
export const getAllRooms = ()=>api.get('/api/rooms');
export const fetchUserData = (data)=>api.post('/api/profile',data);
export const getRoom = (roomId) => api.get(`/api/rooms/${roomId}`);
export const findUser = (data)=> api.post('/api/find-user',data);
export const sendOtpEmail = (data)=>api.post('/api/send-otp-email',data);
export const loginEmail = (data)=>api.post('/api/login-email',data);
export const leaveRoom = (data)=>api.post('/api/leave-room',data);
export const googleLogin = (data) => api.post('/api/google-login', data);
// Interceptors 
api.interceptors.response.use(
    (config)=>
    {
        return config;
    },
    // agar error aata hai 401 then we go to refresh api
    async (error)=>{
        const originalRequest = error.config;
        if(
            error.response.status === 401 &&
            originalRequest &&
            !originalRequest._isRetry
        ){
            originalRequest.isRetry = true;
            try{
                await axios.get(`${process.env.REACT_APP_API_URL}/api/refresh`,
                {
                    withCredentials:true, // http only for cookies
                }
                );
                return api.request(originalRequest);
            } catch(err){
                console.log(err.message);
            }
        }
    })

export default api;
