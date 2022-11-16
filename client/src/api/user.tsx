import axios from "axios";
import { URL } from "./common";

export const LoginUserServerPost = (username: String, password: String) => axios.post(`${URL}/user/login`, {username, password})

export const RegisterUserServerPost = (email: String, password: String, passwordConfirm: String, username: String) => axios.post(`${URL}/user/register`, {email, password, passwordConfirm, username})

export const SetUserInfo = (token:string, oldPassword: string, newPassword: string, newPasswordConfirm: string, newUsername: string, about: string) => axios.post(`${URL}/user/edit`, {newUsername, oldPassword, newPassword, newPasswordConfirm, about}, {
    headers: {
        'Authorization': `Bearer ${token}`
    }
})

export const GetUserInfo = (id: String) => axios.get(`${URL}/user/getUserInfo/${id}`)
export const GetUserPosts = (id: string, sort: string, page: number, limit: number) => axios.get(`${URL}/user/getUserPosts/${id}/?sort=${sort}&page=${page}&limit=${limit}`)
export const GetUserComments = (id: string, sort: string, page: number, limit: number) => axios.get(`${URL}/user/getUserComments/${id}/?sort=${sort}&page=${page}&limit=${limit}`)
