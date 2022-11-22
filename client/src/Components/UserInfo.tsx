import { useLocation, useParams } from "solid-app-router"
import { createSignal, For, JSX, Match, Show, Switch } from "solid-js"
import styles from "./StylingModules/UserInfo.module.css"
import roleBadge from "./StylingModules/RoleBadge.module.css"
import PostPreview from "./PostPreview"
import { GetUserComments, GetUserInfo, GetUserPosts, SetUserInfo } from "../api/user"
import SolidMarkdown from "solid-markdown"
import { LikeComment } from "../api/posts"
import { createStore } from "solid-js/store"
import { Auth, CheckAuthLevel } from "../functions/user"
import Skeleton from "@suid/material/Skeleton"
import TextField from "@suid/material/TextField"
import $ from "jquery"


function Loader() {
    // const isRouting = useIsRouting();
    return (
        <div class={styles.loader}>
          <Skeleton height="2.5rem" variant='circular' style="aspect-ratio: 1/1;" />
          <Skeleton variant='text' width="7.25rem" style="font-size: 2rem;"/>
          <div class={styles.loaderPostContent}>
            <Skeleton variant='text' style="font-size: 1.5rem;"/>
            <Skeleton variant='text' style="font-size: 1rem;"/>
          </div>
          <Skeleton variant='text' style="font-size: 1.5rem;" width="8rem"/>
          <Skeleton variant='rectangular' width="3.25rem" height="2rem" style="border-radius: var(--border-radius)"/>
          <Skeleton variant='rectangular' width="3.25rem" height="2rem" style="border-radius: var(--border-radius)"/>
        </div>
      )
}

export default function UserInfo() {
    const search = useLocation().search
    const searchParams = new URLSearchParams(search)
    const params = useParams()

    const id = params.id

    const [postsLoaded, setPostsLoaded] = createSignal(false)
    const [commentsLoaded, setCommentsLoaded] = createSignal(false)

    const [user, setUser] = createStore({
        username: 'username',
        nicknames: ['nickname', 'nick2'],
        role: "role",
        roleRank: 0,
        profilePicture: "none",
        pfpRaw: "none",
        posts: {
            posts: [],
            sort: (searchParams.get('postSort') || "createdAt"),
            page: parseInt(searchParams.get('postPage') || "1"),
            pages: 0,
            limit: parseInt(searchParams.get('postLimit') || "10")
        },
        numberOfPosts: 0,
        numberOfComments: 0,
        joinedAt: '',
        comments: {
            comments: [],
            sort: (searchParams.get('commentSort') || "createdAt"),
            page: parseInt(searchParams.get('commentPage') || "1"),
            pages: 0,
            limit: parseInt(searchParams.get('commentLimit') || "10")
        },
        about: '',
        email: ''
    })

    // * Active Tav signal
    const [activeTab, setActiveTab] = createSignal('posts')
    const [isEditing, setIsEditing] = createSignal(false)

    GetUserInfo(id).then(res => {
        const { data } = res

        setUser({...data, pfpRaw: data.profilePicture, profilePicture: `data:image/png;base64,${btoa(new Uint8Array(data.profilePicture.data.data).reduce(function (data, byte) {
            return data + String.fromCharCode(byte);
        }, ''))}`})
        
        sortComments()
        sortPosts()
    })

    const EditModal = () => {
        const [userError, setUserError] = createSignal(false)

        const cancel = () => {
            setIsEditing(false)
        }
        const save = () => {
            const newUsername = String($('#user-new-username').val())
            const newPassword = String($('#user-new-password').val())
            const newPasswordConfirm = String($('#user-new-password-confirm').val())
            const oldPassword = String($('#user-old-password').val())
            const about = String($('#user-about-content').val())

            const token = JSON.parse(localStorage.getItem('profile'))?.token


            SetUserInfo(token, oldPassword, newPassword, newPasswordConfirm, newUsername, about).then(res => {
                const {token} = res.data
                const {username, about} = res.data.user

                Auth({result: res.data.user, token})

                setUser({username, about})
            })
            setIsEditing(false)
        }



       

        return (
            <Show when={isEditing()}>
                <form onSubmit={e => e.preventDefault()}>
                    <div class={styles.editModal}>

                        <h2 class={styles.title}>Redigera Profil</h2>
                        <div class={styles.profileContent}>
                            <div class={styles.profilePictureDiv}>
                                <label for="file">
                                    <img id={styles.editProfilePictureModal} class={styles.profilePicture} src={user.profilePicture} alt="" />
                                </label>         
                                <div>
                                    <label for="file"><h3>Ändra profilbild</h3></label>                   
                                    <input type="file" name="file" id="file" />
                                </div>
                            </div>
                            <div class={styles.profileInformation}>
                                <TextField id="user-new-username" label="Användarnamn" variant="standard" classes={{root: styles.input}} error={userError()} helperText={userError() ? "Minst fyra tecken." : ""} onChange={(e) => {
                                    const regex = /[a-zA-Z0-9._-]{4,}/g

                                    if (!e.target.value.match(regex) && !userError()) {
                                        setUserError(true)
                                    } else if (e.target.value.match(regex) && userError()) {
                                        setUserError(false)
                                    }
                                    
                                }} />
                                {/* <div class={styles.input}>
                            <p>Lösenord:</p>
                            <input type="password" name="password" id="login-password"/>
                        </div> * */}
                       <TextField id="user-old-password" label="Nuvarande Lösenord" variant="standard" type="password" required classes={{root: styles.input}} />
                        <TextField id="user-new-password" label="Nytt Lösenord" variant="standard" type="password" classes={{root: styles.input}} />
                        <TextField id="user-new-password-confirm" label="Upprepa Nytt Lösenord" variant="standard" type="password" classes={{root: styles.input}} />
                        
                       
                        
                        
                        <span class={styles.loginError} id="error"></span> 


                            </div>

                        </div>
                        <div class={styles.growWrap} >
                            <textarea class={styles.contentEditing} id="user-about-content" onInput="this.parentNode.dataset.replicatedValue = this.value" placeholder="Berätta lite om dig själv" value={user.about}></textarea>
                        </div>
                        

                        {/* <div class={styles.input}>
                            <p>Anändarnamn / Email:</p>
                            <input type="text" name="email" id="login-email" />
                            <TextField />
                        </div> */}
                       
                       <div class={styles.editModalSubmit}>
                            <button class={styles.saveBtn} id="edit-submit" onClick={save}>Spara Profil</button>
                            <button class={styles.cancelBtn} id="edit-cancel" onClick={cancel}>Avbryt</button>
                       </div>
                      

                        <div class={styles.loginFooter}>
                            <p>Valeria Roleplay | Redigera Profil</p>
                        </div>
                      
                    </div>
                </form>
            </Show>
        )
    }

    const ProfileInfo = () => {
        const EditProfileButton = () => {
            return(
            <>
            <Show when={CheckAuthLevel(JSON.parse(localStorage.getItem('profile'))?.token, 0) && JSON.parse(localStorage.getItem('profile'))?.result.username === user.username}
                fallback={
                    <div class={styles.editProfileBtn}>
                    <i class="material-icons">more_horiz</i>
                    </div>
                }
                >
                    <div class={styles.editProfileBtn}  onClick={() => {
                            setIsEditing(!isEditing())
                            // setActiveTab('about')
                        }}>

                        
                        <p>{isEditing() ? 'Spara profil' : 'Redigera profil'}</p>
                    </div>
                </Show>
            </>)
        } 
        function UserLoader() {
            return (
                <>
                    <Skeleton variant="circular" height="100%" style="aspect-ratio: 1/1; margin-right: 1.25rem;"/>
                    <div class={styles.profileInformation}>
                        <div class={styles.UserProfileInfo}>
                            <div class={styles.userProfileWrapper}>
                                <Skeleton class={styles.profile} width="5rem"/>
                                <div class={styles.usernameAndRoles}>
                                    <Skeleton class={styles.userUsername} width="8rem"/>
                                    <span class={styles.showRole}>
                                        <Skeleton width="3rem" height="2rem"/>
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div class={styles.userStats}>
                            <Skeleton width="30rem" style="font-size: 1.5rem" />
                        </div>
                    </div>
                </>
            )
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
                <EditModal />
                <EditProfileButton/>
                <Show when={user.username != "username"} fallback={UserLoader}>
                    <img class={styles.userProfilePicture} src={user.profilePicture} alt="" srcset="" />
                    <div class={styles.profileInformation}>
                        <div class={styles.UserProfileInfo}>
                            <div class={styles.userProfileWrapper}>
                                <h4 class={styles.profile}> Profil
                                {/* Eventuellt att man har för olika roller som: staff, whitelistad utvecklar mfl */}
                                </h4>
                                <div class={styles.usernameAndRoles}>
                                    <h2 class={styles.userUsername}>{user.username}</h2>
                                    <span class={styles.showRole}>
                                        <Show when={user.roleRank >= 5}>
                                            <i class={'material-icons ' + styles.verified} data={user.role}>verified</i>
                                        </Show>
                                        <i class={roleBadge.role} data={user.role}>{user.role}</i>
                                    </span>
                                    <div class={styles.nicknames}>
                                        <For each={user.nicknames}>{nickname => 
                                            <p>{nickname}</p>
                                        }</For>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class={styles.userStats}>
                            <p class={styles.stat}>Gick med: {FormatDateJoined(user.joinedAt)}</p>
                            <i class={"material-icons " + styles.circleIcon}>circle</i>
                            <p class={styles.stat}>Inlägg: {user.numberOfPosts} st</p>
                            <i class={"material-icons " + styles.circleIcon}>circle</i>
                            <p class={styles.stat}>Komentarer: {user.numberOfComments} st</p>
                        </div>
                    </div>
                </Show>
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
                <TabLink label="Kommentarer" link="comments"/>
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

    async function sortPosts() {
        setPostsLoaded(false)
        const res = await GetUserPosts(id, user.posts.sort, user.posts.page - 1, user.posts.limit)
        const { posts, pages } = res.data
        for(let k in posts) {
            posts[k].creator = {
                username: user.username,
                profilePicture: user.pfpRaw,
                role: user.role,
                roleRank: user.roleRank,
            }
        }
        setUser({posts: {... user.posts, pages: pages, posts: posts}})
        setPostsLoaded(true)
        // })
    }
    
    async function sortComments() {
        setCommentsLoaded(false)
        const res = await GetUserComments(id, user.comments.sort, user.comments.page - 1, user.comments.limit)
        const { comments, pages } = res.data
        for(let k in comments) {
            comments[k].creator = {
                username: user.username,
                profilePicture: user.pfpRaw,
                role: user.role,
                roleRank: user.roleRank,
            }
        }
        setUser({comments: {... user.comments, pages: pages, comments: comments}})
        setCommentsLoaded(true)
        // })
        // })
    }

    function PageButtonPost(props: {
        v: number
    }) {
        const v = props.v

        return (
            <Show when={v + 1 == user.posts.page} fallback={
                <button class={styles.editFeedIconButton} onClick={() => {setUser({posts: {...user.posts, page:v + 1}}); sortPosts();}}>{v + 1}</button>
            }>
                <button class={styles.editFeedIconButton} style="cursor: unset; background-color: var(--color-white-m);">{v + 1}</button>
            </Show>
        )
    }
    function PageButtonComment(props: {
        v: number
    }) {
        const v = props.v

        return (
            <Show when={v + 1 == user.comments.page} fallback={
                <button class={styles.editFeedIconButton} onClick={() => {setUser({comments: {...user.comments, page:v + 1}}); sortComments();}}>{v + 1}</button>
            }>
                <button class={styles.editFeedIconButton} style="cursor: unset; background-color: var(--color-white-m);">{v + 1}</button>
            </Show>
        )
    }

    function PostControls() {
        return (
            <div class={styles.postsControls} style={user.posts.posts.length == 0 ? "display: none;" : ""}>
                <div class={styles.postSortControl}>
                    <button id='sort-hot' class={styles.editFeedIconButton} onClick={() => {
                        if (user.posts.sort == 'interactionCount') {
                            setUser({posts: {...user.posts, sort: 'interactionCount-inverse'}})
                        } else {
                            setUser({posts: {...user.posts, sort: 'interactionCount'}})
                        }

                        sortPosts()
                    }}>
                        <i class='material-icons'>whatshot</i>
                        <p>Populärt</p>
                        <Show when={user.posts.sort == 'interactionCount'}>
                        <i class='material-icons' id='current-sort-icon'>keyboard_double_arrow_down</i>
                        </Show>
                        <Show when={user.posts.sort == 'interactionCount-inverse'}>
                        <i class='material-icons' id='current-sort-icon'>keyboard_double_arrow_up</i>
                        </Show>
                    </button>
                    <button id='sort-latest' class={styles.editFeedIconButton} onClick={() => {
                        if (user.posts.sort == 'createdAt') {
                            setUser({posts: {...user.posts, sort: 'createdAt-inverse'}})
                        } else {
                            setUser({posts: {...user.posts, sort: 'createdAt'}})
                        }

                        sortPosts()
                    }}>
                        <i class='material-icons'>update</i>
                        <p>Senaste</p>
                        <Show when={user.posts.sort == 'createdAt'}>
                        <i class='material-icons' id='current-sort-icon'>keyboard_double_arrow_down</i>
                        </Show>
                        <Show when={user.posts.sort == 'createdAt-inverse'}>
                        <i class='material-icons' id='current-sort-icon'>keyboard_double_arrow_up</i>
                        </Show>
                    </button>
                </div>
                <div class={styles.postPageControl}>
                    <Show when={user.posts.page > 1} fallback={
                        <button class={styles.editFeedIconButton} style="background-color: var(--color-white-m); cursor: unset;"><i class='material-icons'>navigate_before</i></button>
                    }>
                        <button class={styles.editFeedIconButton} onClick={() => {setUser({posts: {...user.posts, page: user.posts.page - 1}}); sortPosts();}}><i class='material-icons'>navigate_before</i></button>
                    </Show>
                    <button class={styles.editFeedIconButton} style="cursor: unset;">Sida: {user.posts.page}</button>
                    <Show when={user.posts.page < user.posts.pages} fallback={
                        <button class={styles.editFeedIconButton} style="background-color: var(--color-white-m); cursor: unset;"><i class='material-icons'>navigate_next</i></button>
                    }>
                        <button class={styles.editFeedIconButton} onClick={() => {setUser({posts: {...user.posts, page: user.posts.page + 1}}); sortPosts();}}><i class='material-icons'>navigate_next</i></button>
                    </Show>
                </div>
            </div>
        )
    }

    function PostPageSelector() {
        return (
            <div class={styles.postsControls} style={"justify-content: center;" + (user.posts.pages < 2 ? "display: none;" : "")}>
                <div class={styles.postPageControl}>
                    <Show when={user.posts.page > 1} fallback={
                        <button class={styles.editFeedIconButton} style="background-color: var(--color-white-m); cursor: unset;"><i class='material-icons'>navigate_before</i></button>
                    }>
                        <button class={styles.editFeedIconButton} onClick={() => {setUser({posts: {...user.posts, page: user.posts.page - 1}}); sortPosts();}}><i class='material-icons'>navigate_before</i></button>
                    </Show>
                    <Show when={user.posts.pages < 15} fallback={
                        <>
                        {/* Make style work when there is alot of postPages */}
                        <Show when={user.posts.page <= 3}>
                            <For each={[... Array(3).keys()]}>{(v, i) =>
                            <PageButtonPost v={v}/>
                            }</For>
                            <p>...</p>
                            <For each={[user.posts.pages - 1]}>{(v, i) =>
                            <PageButtonPost v={v}/>
                            }</For>
                        </Show>
                        <Show when={user.posts.page >= user.posts.pages - 3}>
                            <For each={[0]}>{(v, i) =>
                            <PageButtonPost v={v}/>
                            }</For>
                            <p>...</p>
                            <For each={[user.posts.pages - 3, user.posts.pages - 2, user.posts.pages - 1]}>{(v, i) =>
                            <PageButtonPost v={v}/>
                            }</For>
                        </Show>
                        <Show when={user.posts.page < user.posts.pages - 3 && user.posts.page > 3}>
                            <For each={[0]}>{(v, i) =>
                            <PageButtonPost v={v}/>
                            }</For>
                            <p>...</p>
                            <For each={[user.posts.page - 2, user.posts.page - 1, user.posts.page]}>{(v, i) =>
                            <PageButtonPost v={v}/>
                            }</For>
                            <p>...</p>
                            <For each={[user.posts.pages - 1]}>{(v, i) =>
                            <PageButtonPost v={v}/>
                            }</For>
                        </Show>
                        </>
                    }>
                        <For each={[... Array(user.posts.pages).keys()]}>{(v, i) =>
                        <PageButtonPost v={v}/>
                        }</For>
                    </Show>
                    <Show when={user.posts.page < user.posts.pages} fallback={
                        <button class={styles.editFeedIconButton} style="background-color: var(--color-white-m); cursor: unset;"><i class='material-icons'>navigate_next</i></button>
                    }>
                        <button class={styles.editFeedIconButton} onClick={() => {setUser({posts: {...user.posts, page: user.posts.page + 1}}); sortPosts();}}><i class='material-icons'>navigate_next</i></button>
                    </Show>
                </div>
            </div>
        )
    }

    function CommentControls() {
        return (
            <div class={styles.commentsControls} style={user.comments.comments.length == 0 ? "display: none;" : ""}>
                <div class={styles.commentSortControl}>
                    <button id='sort-hot' class={styles.editFeedIconButton} onClick={() => {
                        if (user.comments.sort == 'interactionCount') {
                            setUser({comments: {...user.comments, sort: 'interactionCount-inverse'}})
                        } else {
                            setUser({comments: {...user.comments, sort: 'interactionCount'}})
                        }

                        sortComments()
                    }}>
                        <i class='material-icons'>whatshot</i>
                        <p>Populärt</p>
                        <Show when={user.comments.sort == 'interactionCount'}>
                        <i class='material-icons' id='current-sort-icon'>keyboard_double_arrow_down</i>
                        </Show>
                        <Show when={user.comments.sort == 'interactionCount-inverse'}>
                        <i class='material-icons' id='current-sort-icon'>keyboard_double_arrow_up</i>
                        </Show>
                    </button>
                    <button id='sort-latest' class={styles.editFeedIconButton} onClick={() => {
                        if (user.comments.sort == 'createdAt') {
                            setUser({comments: {...user.comments, sort: 'createdAt-inverse'}})
                        } else {
                            setUser({comments: {...user.comments, sort: 'createdAt'}})
                        }

                        sortComments()
                    }}>
                        <i class='material-icons'>update</i>
                        <p>Senaste</p>
                        <Show when={user.comments.sort == 'createdAt'}>
                        <i class='material-icons' id='current-sort-icon'>keyboard_double_arrow_down</i>
                        </Show>
                        <Show when={user.comments.sort == 'createdAt-inverse'}>
                        <i class='material-icons' id='current-sort-icon'>keyboard_double_arrow_up</i>
                        </Show>
                    </button>
                </div>
                <div class={styles.commentPageControl}>
                    <Show when={user.comments.page > 1} fallback={
                        <button class={styles.editFeedIconButton} style="background-color: var(--color-white-m); cursor: unset;"><i class='material-icons'>navigate_before</i></button>
                    }>
                        <button class={styles.editFeedIconButton} onClick={() => {setUser({comments: {...user.comments, page: user.comments.page - 1}}); sortComments();}}><i class='material-icons'>navigate_before</i></button>
                    </Show>
                    <button class={styles.editFeedIconButton} style="cursor: unset;">Sida: {user.comments.page}</button>
                    <Show when={user.comments.page < user.comments.pages} fallback={
                        <button class={styles.editFeedIconButton} style="background-color: var(--color-white-m); cursor: unset;"><i class='material-icons'>navigate_next</i></button>
                    }>
                        <button class={styles.editFeedIconButton} onClick={() => {setUser({comments: {...user.comments, page: user.comments.page + 1}}); sortComments();}}><i class='material-icons'>navigate_next</i></button>
                    </Show>
                </div>
            </div>
        )
    }

    function CommentPageSelector() {
        return (
            <div class={styles.commentsControls} style={"justify-content: center;" + (user.comments.pages < 2 ? "display: none;" : "")}>
                <div class={styles.commentPageControl}>
                    <Show when={user.comments.page > 1} fallback={
                        <button class={styles.editFeedIconButton} style="background-color: var(--color-white-m); cursor: unset;"><i class='material-icons'>navigate_before</i></button>
                    }>
                        <button class={styles.editFeedIconButton} onClick={() => {setUser({comments: {...user.comments, page: user.comments.page - 1}}); sortComments();}}><i class='material-icons'>navigate_before</i></button>
                    </Show>
                    <Show when={user.comments.pages < 15} fallback={
                        <>
                        {/* Make style work when there is alot of commentPages */}
                        <Show when={user.comments.page <= 3}>
                            <For each={[... Array(3).keys()]}>{(v, i) =>
                            <PageButtonComment v={v}/>
                            }</For>
                            <p>...</p>
                            <For each={[user.comments.pages - 1]}>{(v, i) =>
                            <PageButtonComment v={v}/>
                            }</For>
                        </Show>
                        <Show when={user.comments.page >= user.comments.pages - 3}>
                            <For each={[0]}>{(v, i) =>
                            <PageButtonComment v={v}/>
                            }</For>
                            <p>...</p>
                            <For each={[user.comments.pages - 3, user.comments.pages - 2, user.comments.pages - 1]}>{(v, i) =>
                            <PageButtonComment v={v}/>
                            }</For>
                        </Show>
                        <Show when={user.comments.page < user.comments.pages - 3 && user.comments.page > 3}>
                            <For each={[0]}>{(v, i) =>
                            <PageButtonComment v={v}/>
                            }</For>
                            <p>...</p>
                            <For each={[user.comments.page - 2, user.comments.page - 1, user.comments.page]}>{(v, i) =>
                            <PageButtonComment v={v}/>
                            }</For>
                            <p>...</p>
                            <For each={[user.comments.pages - 1]}>{(v, i) =>
                            <PageButtonComment v={v}/>
                            }</For>
                        </Show>
                        </>
                    }>
                        <For each={[... Array(user.comments.pages).keys()]}>{(v, i) =>
                        <PageButtonComment v={v}/>
                        }</For>
                    </Show>
                    <Show when={user.comments.page < user.comments.pages} fallback={
                        <button class={styles.editFeedIconButton} style="background-color: var(--color-white-m); cursor: unset;"><i class='material-icons'>navigate_next</i></button>
                    }>
                        <button class={styles.editFeedIconButton} onClick={() => {setUser({comments: {...user.comments, page: user.comments.page + 1}}); sortComments();}}><i class='material-icons'>navigate_next</i></button>
                    </Show>
                </div>
            </div>
        )
    }

    function Comment(props: {
        comment: any;
    }) {        
        const [likedByUser, setLikedByUser] = createSignal(props.comment.likes?.includes(JSON.parse(localStorage.getItem('profile'))?.result._id) || false)
        const [likeCount, setLikeCount] = createSignal(props.comment.likes?.length || 0)

        const profilePicture = `data:image/png;base64,${btoa(new Uint8Array(props.comment.creator.profilePicture.data.data).reduce(function (data, byte) {
            return data + String.fromCharCode(byte);
        }, ''))}`

        return(
            <>
                <div class={styles.postComment} id={props.comment._id}>
                    <Show when={props.comment.respondsTo}>
                        <a class={styles.respondsTo}>
                            <i class="material-icons">reply</i><p>@{props.comment.respondsTo.creator.username} {props.comment.respondsTo.content}</p>
                        </a>
                    </Show>

                    <a class={styles.CommentCreator} href={"/forum/user/" + props.comment.creator._id}>
                        <div class={styles.creatorImg}>
                         <img class={styles.creatorImg} src={profilePicture} alt="" />
                         <Show when={props.comment.creator.roleRank >= 5}>
                             <i class={'material-icons ' + styles.verified} data={props.comment.creator.role}>verified</i>
                        </Show>
                        </div>
                        <h2 class={styles.creatorName}>{props.comment.creator.username}</h2>
                        <Show when={props.comment.creator.roleRank >= 5}>
                            <i class={roleBadge.role} data={props.comment.creator.role}>{props.comment.creator.role}</i>
                        </Show>
                    </a>



                    <a class={styles.feedTitle} href={"/forum/post/" + props.comment.onPost + "?comment=" + props.comment._id}>
                        <SolidMarkdown>{props.comment.content}</SolidMarkdown>
                    </a>

                    <div class={styles.commentStatitics} >
                        <PostStatitics date={props.comment.createdAt} />
                        <button class={styles.postLikeButton} onClick={() => {
                            LikeComment(props.comment._id, JSON.parse(localStorage.getItem('profile'))?.token).then((res) => {
                                setLikeCount(res.data.likes.length)
                                setLikedByUser(res.data.likes.includes(JSON.parse(localStorage.getItem('profile'))?.result._id))
                            })
                        }}>
                            <i class='material-icons' style={likedByUser() ? "color: var(--color-blue-l);" : "color: inherit;"}>thumb_up</i>
                            <span>{likeCount()}</span>
                        </button>
                    </div>

                </div>
            </>
        )
    }

    return(
        <>
            {/* <Show when={user.username != 'username'} fallback={Loader}> */}
                {/* <Loader /> */}
                <UserProfile />
                <div class={styles.userPosts}>
                    <Switch>
                        <Match when={activeTab() === 'posts'}>
                            <PostControls />
                            <div class={styles.posts} id="posts">
                                <Show when={postsLoaded()} fallback={Loader}>
                                    <For each={user.posts.posts}>{post =>
                                        <PostPreview data={post}/>
                                    }</For>
                                </Show>
                            </div>
                            <PostPageSelector />
                        </Match>
                        <Match when={activeTab() === 'comments'}>
                            <CommentControls />
                            <div class={styles.comments} id="comments">
                                <Show when={commentsLoaded()} fallback={Loader}>
                                    <For each={user.comments.comments}>{comment =>

                                        <Comment comment={comment}/>
                                    }</For>
                                </Show>
                            </div>
                            <CommentPageSelector />
                        </Match>
                        <Match when={activeTab() === 'about'}>
                            {user.about}
                        </Match>
                    </Switch>
                </div>
            {/* </Show> */}
        </>
    )
}

const PostStatitics = (props: {
    date: string;
}) => {
    const date = timeSince(new Date(props.date).getTime())

    return (
        <>
        <div class={styles.postStats}>
            <p class={styles.date}>{date}</p>
        </div>

        </>
    )

};

export function timeSince(date) {

    var seconds = Math.floor((new Date() - date) / 1000);

    var interval = seconds / 31536000;

    if (interval > 1) {
        return Math.floor(interval) + " år";
    }
    interval = seconds / 2592000;
    if (interval > 1) {
        return Math.floor(interval) + " månad" + (Math.floor(interval) == 1 ? "" : "er");
    }
    interval = seconds / 86400;
    if (interval > 1) {
        return Math.floor(interval) + " dag" + (Math.floor(interval) == 1 ? "" : "ar");
    }
    interval = seconds / 3600;
    if (interval > 1) {
        return Math.floor(interval) + " timm" + (Math.floor(interval) == 1 ? "e" : "ar");
    }
    interval = seconds / 60;
    if (interval > 1) {
        return Math.floor(interval) + " minut" + (Math.floor(interval) == 1 ? "" : "er");
    }
    return Math.floor(seconds) + " sekund" + (Math.floor(interval) == 1 ? "" : "er");
}