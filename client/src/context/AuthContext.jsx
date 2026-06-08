import {
        createContext,
        useContext,
        useEffect,
        useState,
    } from 'react';
import api from '../services/api';

const AuthContext = createContext();
export function AuthProvider({children}){
    const [user,setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    async function loadUser(){
        const token = localStorage.getItem('token');
        if(!token){
            setLoading(false);
            return;
        }
        try{
            const response = await api.get('/auth/me');
            setUser(response.data.user);
        }catch(error){
            localStorage.removeItem('token');
            setUser(null);
        }
        setLoading(false);
    }
    useEffect(()=>{
        loadUser();
    },[]);

    async function login(email, password, captchaToken) {
        const response = await api.post(
            '/auth/login',
            { email, password, captchaToken }
        );
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
    }

    async function loginWithGoogle(googleToken){
        const response = await api.post(
            '/auth/google',
            { token: googleToken },
        );
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
    }

    async function register(email, password, captchaToken) {
        await api.post(
            '/auth/register',
            {
                email,
                password,
                captchaToken,
            },
        );
    }

    function logout(){
        localStorage.removeItem('token');
        setUser(null);
    }
    return (
        <AuthContext.Provider
            value = {{
                user,
                login,
                loginWithGoogle,
                register,
                logout,
                loading,
            }}
        >
        {children}
        </AuthContext.Provider>
    );
}

export function useAuth(){
    return useContext(AuthContext);
}