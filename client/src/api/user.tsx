import axios from "axios";
import { URL } from "./common";

export const LoginUserServerPost = (username: String, password: String) => axios.post(`${URL}/user/login`, {username, password})

export const RegisterUserServerPost = (email: String, password: String, passwordConfirm: String, username: String) => axios.post(`${URL}/user/register`, {email, password, passwordConfirm, username})

