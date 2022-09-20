import axios from "axios";
import { URL } from "./common";

export const GetPinnedPosts = () => axios.get(`${URL}/posts/getPinnedPosts`)
export const GetAllPosts = () => axios.get(`${URL}/posts/getAllPosts`)

export const GetPost = (postId: String) => axios.get(`${URL}/posts/getPost/${postId}`)
export const NewComment = async (postId: String, content: String, token: String) => axios.post(`${URL}/posts/newComment/${postId}`, { content }, {
    headers: {
        'Authorization': `Bearer ${token}`
    }
})