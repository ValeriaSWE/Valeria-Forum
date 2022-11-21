import axios from "axios";
import { URL } from "./common";

export const GetPinnedPosts = () => axios.get(`${URL}/posts/getPinnedPosts/?sort=createdAt&page=0&limit=5`)
export const GetAllPosts = (sort: string, page: number, limit: number, tags: string[]) => axios.get(`${URL}/posts/getAllPosts/?sort=${sort}&page=${page}&limit=${limit}&tags=${JSON.stringify(tags)}`)

export const GetPost = (postId: string, commentSort: string, commentPage: number, commentLimit: number) => axios.get(`${URL}/posts/getPost/${postId}/?commentSort=${commentSort}&commentPage=${commentPage}&commentLimit=${commentLimit}`)
export const GetImage = (imageId: string) => axios.get(`${URL}/posts/getImage/${imageId}`)
export const NewComment = async (postId: string, content: string, respondsTo: string | null, token: string) => axios.post(`${URL}/posts/newComment/${postId}`, { content, respondsTo }, {
    headers: {
        'Authorization': `Bearer ${token}`
    }
})
export const LikePost = async (postId: string, token: string) => axios.post(`${URL}/posts/likePost/${postId}`, {}, {
    headers: {
        'Authorization': `Bearer ${token}`
    }
})
export const CreatePost = (formData: FormData, token: string) => axios.post(`${URL}/posts/createPost`, formData, {
    headers: {
        // 'content-type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
    }
})
export const LikeComment = async (commentId: string, token: string) => axios.post(`${URL}/posts/likeComment/${commentId}`, {}, {
    headers: {
        'Authorization': `Bearer ${token}`
    }
})
export const EditPost = (postId: string, content: string, tags: string[], token: string) => axios.post(`${URL}/posts/editPost`, {postId, content, tags}, {
    headers: {
        // 'content-type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
    }
})

export const GetAllowedTags = (token: string) => axios.get(`${URL}/tags/getTags`, {
    headers: {
        // 'content-type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
    }
})
export const GetAllTags = (token: string) => axios.get(`${URL}/tags/getAllTags`, {
    headers: {
        // 'content-type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
    }
})