import {useState,useEffect} from 'react';
import axios from 'axios';
import { setAuth } from '../store/authSlice';
import { useDispatch } from 'react-redux';

export function useLoadingWithRefresh(){
    const [loading,setLoading] = useState(true);
    const dispatch = useDispatch();
    useEffect(()=>{
        (async()=>{
            try{
                const {data} = await axios.get(
                    `${process.env.REACT_APP_API_URL}/api/refresh`,
                    {
                        withCredentials: true,
                    }
                );
                dispatch(setAuth(data));
                setLoading(false);
            }catch(err){
                console.log(err);
                setLoading(false);
            }
        })();
    },[]);
    return {loading};
}
// custom hook