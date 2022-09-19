import axios from "axios";
import { URL } from "./common";

export const GetPinnedPosts = () => axios.get(`${URL}/posts/getPinnedPosts`)
export const GetAllPosts = () => axios.get(`${URL}/posts/getAllPosts`)