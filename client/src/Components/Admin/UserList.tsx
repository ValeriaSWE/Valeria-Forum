import $ from "jquery"
import { GetUserList, SetUserRole } from "../../api/admin"

const Roles = {
    'pleb': 0,
    'DEV': 10,
}

export default function AdminUserList() {
    return (
        <>
            <div id="list">
            </div>
        </>
    )
}

const EditUser = (user) => {
    return async () => {
        if ($("#edit-" + user.username).html() == "Redigera") {

            $('#role-' + user.username).before(`
            <select id="role-select-${user.username}" name="role-select-${user.username}">
            </select>
            `)
            for (const key in Roles) {
                console.log(key)
                $('#role-select-' + user.username).append(`<option value="${key}">${key}</option>`)
            }
            $('#role-' + user.username).remove()
            $("#edit-" + user.username).html("Spara")
        } else {
            const newRole = $('#role-select-' + user.username).val()

            const tmp = await SetUserRole(JSON.parse(localStorage.getItem('profile'))?.token, user._id, newRole, Roles[newRole])

            user = tmp.data

            $('#role-select-' + user.username).before(`
                <p id="role-${user.username}">${user.role}</p>
            `)
            $('#role-select-' + user.username).remove()
            $("#edit-" + user.username).html("Redigera")
        }
    }
}

const UserElement = (props: {
    user: {
        username: string;
        email: string;
        nicknames: [string];
        role: string;
        profilePicture: object;
    };
}) => {
    const user = props.user

    const profilePicture = `data:image/png;base64,${btoa(new Uint8Array(user.profilePicture.data.data).reduce(function (data, byte) {
        return data + String.fromCharCode(byte);
    }, ''))}`

    return (
        <>
            <div id="element" style={"display: flex; gap: 2rem;"}>
                <img src={profilePicture} width="100px"/>
                <h3 id={"username-" + user.username}>{user.username}</h3>
                <p id={"role-" + user.username}>{user.role}</p>
                <p>{user.email}</p>
                {/* <p>{user.nicknames}</p> */}
                <button id={"edit-" + user.username} onClick={EditUser(user)}>Redigera</button>
            </div>
        </>
    )

}

$(async function() {
    const {data} = await GetUserList(JSON.parse(localStorage.getItem("profile"))?.token)
    console.log(data)
    data.forEach(user => {
        $('#list').append(<UserElement user={user} />)
    });
})

