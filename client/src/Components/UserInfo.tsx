import { useParams } from "solid-app-router"
import { createSignal, For, Show } from "solid-js"
import styles from "./StylingModules/UserInfo.module.css"
import roleBadge from "./StylingModules/RoleBadge.module.css"
import PostPreview from "./PostPreview"
import { GetUserInfo, GetUserPosts } from "../api/user"

export default function UserInfo() {
    const params = useParams()

    const id = params.id

    const [username, setUsername] = createSignal('username')
    const [nicknames, setNicknames] = createSignal(['nickname', "nickname2"])
    const [role, setRole] = createSignal('role')
    const [roleRank, setRoleRank] = createSignal(0)
    const [profilePicture, setProfilePicture] = createSignal('none')
    const [userPosts, setUserPosts] = createSignal([])

    GetUserInfo(id).then(res => {
        const { data } = res

        const pfpRawData = data.profilePicture

        setUsername(data.username)
        setRole(data.role)
        setRoleRank(data.roleRank)
        setNicknames(data.nicknames)
        setProfilePicture(`data:image/png;base64,${btoa(new Uint8Array(data.profilePicture.data.data).reduce(function (data, byte) {
            return data + String.fromCharCode(byte);
        }, ''))}`)
        
        GetUserPosts(id).then(res => {
            const { data } = res
    
            for(let k in data) {
                data[k].creator = {
                    username: username(),
                    profilePicture: pfpRawData,
                    role: role(),
                    roleRank: roleRank(),
                }
            }
    
            setUserPosts(data)
        })
    })


    return(
        <>
            <img src={profilePicture()} alt="" srcset="" />
            <h2>{username()}</h2>
            <span class={styles.showRole}>
                <Show when={roleRank() >= 5}>
                    <i class={'material-icons ' + styles.verified} data={role()}>verified</i>
                </Show>
                <i class={roleBadge.role} data={role()}>{role()}</i>
            </span>
            <div class={styles.nicknames}>
                <For each={nicknames()}>{nickname => 
                    <p>{nickname}</p>
                }</For>
            </div>
            <div class={styles.userPosts}>
                <For each={userPosts()}>{post =>
                    <PostPreview data={post}/>
                    // <></>
                }</For>
            </div>
        </>
    )
}