import axios from "axios";
import { URL } from "./common";

export const GetPinnedPosts = () => axios.get(`${URL}/posts/getPinnedPosts/?sort=createdAt&startIndex=0`)
export const GetAllPosts = (sort, startIndex) => axios.get(`${URL}/posts/getAllPosts/?sort=${sort}&startIndex=${startIndex}`)

export const GetPost = (postId: String) => axios.get(`${URL}/posts/getPost/${postId}`)
export const NewComment = async (postId: String, content: String, token: String) => axios.post(`${URL}/posts/newComment/${postId}`, { content }, {
    headers: {
        'Authorization': `Bearer ${token}`
    }
})
export const LikePost = async (postId: String, token: String) => axios.post(`${URL}/posts/likePost/${postId}`, {}, {
    headers: {
        'Authorization': `Bearer ${token}`
    }
})
export const CreatePost = (title: String, content: String, images: [any], token: String) => axios.post(`${URL}/posts/createPost`, { title, content, images }, {
    headers: {
        'Authorization': `Bearer ${token}`
    }
})