import axios from "axios";
import { URL } from "./common";

export const GetUserList = (token) => axios.get(`${URL}/admin/getUserList`, {
    headers: {
        'Authorization': `Bearer ${token}`
    }
})

export const SetUserRole = (token, id, newRole, newRoleRank) => axios.post(`${URL}/admin/setUserRole`, { id, newRole, newRoleRank }, {
    headers: {
        'Authorization': `Bearer ${token}`
    }
})