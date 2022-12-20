import axios from "axios";
import { URL } from "./common";

export const GetUserList = (token: string) => axios.get(`${API_URL}/admin/getUserList`, {
    headers: {
        'Authorization': `Bearer ${token}`
    }
})

export const SetUserRole = (token: string, id: string, newRole: string, newRoleRank: number) => axios.post(`${API_URL}/admin/setUserRole`, { id, newRole, newRoleRank }, {
    headers: {
        'Authorization': `Bearer ${token}`
    }
})