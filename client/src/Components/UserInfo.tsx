import { useParams } from "solid-app-router"
import { createSignal, For, JSX, Match, Show, Switch } from "solid-js"
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
    const [joinedAt, setjoinedAt] = createSignal('')

    // Test: vilken tab som är aktiv
    const [activeTab, setActiveTab] = createSignal('posts')

    GetUserInfo(id).then(res => {
        const { data } = res

        const pfpRawData = data.profilePicture

        setUsername(data.username)
        setRole(data.role)
        setRoleRank(data.roleRank)
        setNicknames(data.nicknames)
        setjoinedAt(data.joinedAt);
        setProfilePicture(`data:image/png;base64,${btoa(new Uint8Array(data.profilePicture.data.data).reduce(function (data, byte) {
            return data + String.fromCharCode(byte);
        }, ''))}`)
        
        GetUserPosts(data._id).then(res => {
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

    const ProfileInfo = () => {
        const EditProfileButton = () => {
            return(
            <>
            <div class={styles.editProfileBtn}>

                <Show when={JSON.parse(localStorage.getItem('profile'))?.result.username === username()}
                fallback={
                    <i class="material-icons">more_horiz</i>
                }
                >
                <p>Redigera profil</p>
                </Show>
            </div>
            </>)
        } 

        const FormatDateJoined = (date:string) => {
            let formatDate = date.split("T")[0].split('-').reverse()
            var monthNames = [
                "Januari", "Feburari", "Mars",
                "April", "Maj", "Juni",
                "July", "August", "September",
                "Oktober", "November", "December"
            ];
            return(`${formatDate[0]} ${monthNames[parseInt(formatDate[1]) -1]} ${formatDate[2]}`)
        }
        return(
        <>  
            <div class={styles.userInfo}>
                <EditProfileButton />
                <img class={styles.userProfilePicture} src={profilePicture()} alt="" srcset="" />
                <div class={styles.profileInformation}>
                    <div class={styles.UserProfileInfo}>
                        <div class={styles.userProfileWrapper}>
                            <h4 class={styles.profile}> Profil
                            {/* Eventuellt att man har för olika roller som: staff, whitelistad utvecklar mfl */}
                            </h4>
                            <div class={styles.usernameAndRoles}>
                                <h2 class={styles.userUsername}>{username()}</h2>
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
                            </div>
                        </div>
                    </div>
                    <div class={styles.userStats}>
                        <p class={styles.stat}>Gick med: {FormatDateJoined(joinedAt())}</p>
                        <i class={"material-icons " + styles.circleIcon}>circle</i>
                        <p class={styles.stat}>Meddelanden: 123 st</p>
                    </div>
                </div>
            </div>
        </>)
    }


    const Tab = () => {
        const TabLink = (props: { 
            label: string,
            link: string
        }) => {
            return(
                <div class={styles.tabLink}
                id={activeTab() === props.link ? styles.active: undefined}
                onclick={() => {
                    setActiveTab(props.link);
                }}
                >
                {props.label}
                </div>
            )
        }

        return(
            <>
            <div class={styles.tabLinks} >
                <TabLink label="Inlägg" link="posts"/>
                <TabLink label="Om" link="about"/>
            </div>
            </>
        )
    }


    const UserProfile = () => {
        return(
            <>
            <div class={styles.userProfile}>
                <ProfileInfo />
                <Tab />
            </div>
            </>
        );
    };

    return(
        <>
            <UserProfile />
            <div class={styles.userPosts}>
                <Switch>
                    <Match when={activeTab() === 'posts'}>
                        <For each={userPosts()}>{post =>
                        <PostPreview data={post}/>
                        // <></>
                        }</For>
                    </Match>
                    <Match when={activeTab() === 'about'}>
                        om personen
                    </Match>
                </Switch>
            </div>
        </>
    )
}