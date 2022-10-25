import { useLocation, useParams } from "solid-app-router"
import { createSignal, For, JSX, Match, Show, Switch } from "solid-js"
import styles from "./StylingModules/UserInfo.module.css"
import roleBadge from "./StylingModules/RoleBadge.module.css"
import PostPreview from "./PostPreview"
import { GetUserComments, GetUserInfo, GetUserPosts } from "../api/user"
import SolidMarkdown from "solid-markdown"
import { LikeComment } from "../api/posts"

export default function UserInfo() {
    const search = useLocation().search
    const searchParams = new URLSearchParams(search)
    const params = useParams()

    const id = params.id

    const [username, setUsername] = createSignal('username')
    const [nicknames, setNicknames] = createSignal(['nickname', "nickname2"])
    const [role, setRole] = createSignal('role')
    const [roleRank, setRoleRank] = createSignal(0)
    const [profilePicture, setProfilePicture] = createSignal('none')
    const [pfpRaw, setPfpRaw] = createSignal('none')
    const [userPosts, setUserPosts] = createSignal([])
    const [joinedAt, setJoinedAt] = createSignal('')
    const [amountOfPosts, setAmountOfPosts] = createSignal(0)
    const [amountOfComments, setAmountOfComments] = createSignal(0)

    // * User post sorting signals
    const [postSort, setPostSort] = createSignal(searchParams.get('postSort') || "createdAt")
    const [postPage, setPostPage] = createSignal(parseInt(searchParams.get('postPage') || "1"))
    const [postPages, setPostPages] = createSignal(1)
    const [postLimit, setPostLimit] = createSignal(parseInt(searchParams.get('postLimit') || "10"))

    // * User comment sorting signals
    const [comments, setComments] = createSignal([])
    const [commentSort, setCommentSort] = createSignal(searchParams.get('commentSort') || "createdAt")
    const [commentPage, setCommentPage] = createSignal(parseInt(searchParams.get('commentPage') || "1"))
    const [commentPages, setCommentPages] = createSignal(1)
    const [commentLimit, setCommentLimit] = createSignal(parseInt(searchParams.get('commentLimit') || "10"))

    // Test: vilken tab som är aktiv
    const [activeTab, setActiveTab] = createSignal('posts')

    GetUserInfo(id).then(res => {
        const { data } = res

        setPfpRaw(data.profilePicture)

        setUsername(data.username)
        setRole(data.role)
        setRoleRank(data.roleRank)
        setNicknames(data.nicknames)
        setJoinedAt(data.joinedAt);
        setAmountOfPosts(data.numberOfPosts)
        setAmountOfComments(data.numberOfComments)
        setProfilePicture(`data:image/png;base64,${btoa(new Uint8Array(data.profilePicture.data.data).reduce(function (data, byte) {
            return data + String.fromCharCode(byte);
        }, ''))}`)
        
        sortComments()
        sortPosts()
        // GetUserPosts(data._id, postSort(), postPage() - 1, postLimit()).then(res => {
        //     console.log(res)
        //     const { posts, pages } = res.data
        //     for(let k in posts) {
        //         posts[k].creator = {
        //             username: username(),
        //             profilePicture: pfpRaw(),
        //             role: role(),
        //             roleRank: roleRank(),
        //         }
        //     }
        //     setPostPages(pages)
    
        //     setUserPosts(posts)
        // })
        
        // GetUserComments(data._id, commentSort(), commentPage() - 1, commentLimit()).then(res => {
        //     console.log(res)
        //     const { comments, pages } = res.data
        //     for(let k in comments) {
        //         comments[k].creator = {
        //             username: username(),
        //             profilePicture: pfpRaw(),
        //             role: role(),
        //             roleRank: roleRank(),
        //         }
        //     }
        //     setCommentPages(pages)
    
        //     setComments(comments)
        // })
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
                        <p class={styles.stat}>Inlägg: {amountOfPosts()} st</p>
                        <i class={"material-icons " + styles.circleIcon}>circle</i>
                        <p class={styles.stat}>Komentarer: {amountOfComments()} st</p>
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
        const res = await GetUserPosts(id, postSort(), postPage() - 1, postLimit())
        const { posts, pages } = res.data
        for(let k in posts) {
            posts[k].creator = {
                username: username(),
                profilePicture: pfpRaw(),
                role: role(),
                roleRank: roleRank(),
            }
        }
        setPostPages(pages)
        setUserPosts(posts)
        // })
    }
    
    async function sortComments() {
        GetUserComments(id, commentSort(), commentPage() - 1, commentLimit()).then(res => {
            console.log(res)
            const { comments, pages } = res.data
            for(let k in comments) {
                comments[k].creator = {
                    username: username(),
                    profilePicture: pfpRaw(),
                    role: role(),
                    roleRank: roleRank(),
                }
            }
            setCommentPages(pages)
    
            setComments(comments)
        })
        // })
    }

    function PageButton(props: {
        v: number
    }) {
        const v = props.v

        return (
            <Show when={v + 1 == postPage()} fallback={
                <button class={styles.editFeedIconButton} onClick={() => {setPostPage(v + 1); sortPosts();}}>{v + 1}</button>
            }>
                <button class={styles.editFeedIconButton} style="cursor: unset; background-color: var(--color-white-m);">{v + 1}</button>
            </Show>
        )
    }

    function PostControls() {
        return (
            <div class={styles.postsControls} style={userPosts().length == 0 ? "display: none;" : ""}>
                <div class={styles.postSortControl}>
                    <button id='sort-hot' class={styles.editFeedIconButton} onClick={() => {
                        if (postSort() == 'interactionCount') {
                        setPostSort('interactionCount-inverse')
                        } else {
                        setPostSort('interactionCount')
                        }

                        sortPosts()
                    }}>
                        <i class='material-icons'>whatshot</i>
                        <p>Populärt</p>
                        <Show when={postSort() == 'interactionCount'}>
                        <i class='material-icons' id='current-sort-icon'>keyboard_double_arrow_down</i>
                        </Show>
                        <Show when={postSort() == 'interactionCount-inverse'}>
                        <i class='material-icons' id='current-sort-icon'>keyboard_double_arrow_up</i>
                        </Show>
                    </button>
                    <button id='sort-latest' class={styles.editFeedIconButton} onClick={() => {
                        if (postSort() == 'createdAt') {
                        setPostSort('createdAt-inverse')
                        } else {
                        setPostSort('createdAt')
                        }

                        sortPosts()
                    }}>
                        <i class='material-icons'>update</i>
                        <p>Senaste</p>
                        <Show when={postSort() == 'createdAt'}>
                        <i class='material-icons' id='current-sort-icon'>keyboard_double_arrow_down</i>
                        </Show>
                        <Show when={postSort() == 'createdAt-inverse'}>
                        <i class='material-icons' id='current-sort-icon'>keyboard_double_arrow_up</i>
                        </Show>
                    </button>
                </div>
                <div class={styles.postPageControl}>
                    <Show when={postPage() > 1} fallback={
                        <button class={styles.editFeedIconButton} style="background-color: var(--color-white-m); cursor: unset;"><i class='material-icons'>navigate_before</i></button>
                    }>
                        <button class={styles.editFeedIconButton} onClick={() => {setPostPage(postPage() - 1); sortPosts();}}><i class='material-icons'>navigate_before</i></button>
                    </Show>
                    <button class={styles.editFeedIconButton} style="cursor: unset;">Sida: {postPage()}</button>
                    <Show when={postPage() < postPages()} fallback={
                        <button class={styles.editFeedIconButton} style="background-color: var(--color-white-m); cursor: unset;"><i class='material-icons'>navigate_next</i></button>
                    }>
                        <button class={styles.editFeedIconButton} onClick={() => {setPostPage(postPage() + 1); sortPosts();}}><i class='material-icons'>navigate_next</i></button>
                    </Show>
                </div>
            </div>
        )
    }

    function PostPageSelector() {
        return (
            <div class={styles.postsControls} style={"justify-content: center;" + (postPages() < 2 ? "display: none;" : "")}>
                <div class={styles.postPageControl}>
                    <Show when={postPage() > 1} fallback={
                        <button class={styles.editFeedIconButton} style="background-color: var(--color-white-m); cursor: unset;"><i class='material-icons'>navigate_before</i></button>
                    }>
                        <button class={styles.editFeedIconButton} onClick={() => {setPostPage(postPage() - 1); sortPosts();}}><i class='material-icons'>navigate_before</i></button>
                    </Show>
                    <Show when={postPages() < 15} fallback={
                        <>
                        {/* Make style work when there is alot of postPages */}
                        <Show when={postPage() <= 3}>
                            <For each={[... Array(3).keys()]}>{(v, i) =>
                            <PageButton v={v}/>
                            }</For>
                            <p>...</p>
                            <For each={[postPages() - 1]}>{(v, i) =>
                            <PageButton v={v}/>
                            }</For>
                        </Show>
                        <Show when={postPage() >= postPages() - 3}>
                            <For each={[0]}>{(v, i) =>
                            <PageButton v={v}/>
                            }</For>
                            <p>...</p>
                            <For each={[postPages() - 3, postPages() - 2, postPages() - 1]}>{(v, i) =>
                            <PageButton v={v}/>
                            }</For>
                        </Show>
                        <Show when={postPage() < postPages() - 3 && postPage() > 3}>
                            <For each={[0]}>{(v, i) =>
                            <PageButton v={v}/>
                            }</For>
                            <p>...</p>
                            <For each={[postPage() - 2, postPage() - 1, postPage()]}>{(v, i) =>
                            <PageButton v={v}/>
                            }</For>
                            <p>...</p>
                            <For each={[postPages() - 1]}>{(v, i) =>
                            <PageButton v={v}/>
                            }</For>
                        </Show>
                        </>
                    }>
                        <For each={[... Array(postPages()).keys()]}>{(v, i) =>
                        <PageButton v={v}/>
                        }</For>
                    </Show>
                    <Show when={postPage() < postPages()} fallback={
                        <button class={styles.editFeedIconButton} style="background-color: var(--color-white-m); cursor: unset;"><i class='material-icons'>navigate_next</i></button>
                    }>
                        <button class={styles.editFeedIconButton} onClick={() => {setPostPage(postPage() + 1); sortPosts();}}><i class='material-icons'>navigate_next</i></button>
                    </Show>
                </div>
            </div>
        )
    }

    function CommentControls() {
        return (
            <div class={styles.commentsControls} style={comments().length == 0 ? "display: none;" : ""}>
                <div class={styles.commentSortControl}>
                    <button id='sort-hot' class={styles.editFeedIconButton} onClick={() => {
                        if (commentSort() == 'interactionCount') {
                        setCommentSort('interactionCount-inverse')
                        } else {
                        setCommentSort('interactionCount')
                        }

                        sortComments()
                    }}>
                        <i class='material-icons'>whatshot</i>
                        <p>Populärt</p>
                        <Show when={commentSort() == 'interactionCount'}>
                        <i class='material-icons' id='current-sort-icon'>keyboard_double_arrow_down</i>
                        </Show>
                        <Show when={commentSort() == 'interactionCount-inverse'}>
                        <i class='material-icons' id='current-sort-icon'>keyboard_double_arrow_up</i>
                        </Show>
                    </button>
                    <button id='sort-latest' class={styles.editFeedIconButton} onClick={() => {
                        if (commentSort() == 'createdAt') {
                        setCommentSort('createdAt-inverse')
                        } else {
                        setCommentSort('createdAt')
                        }

                        sortComments()
                    }}>
                        <i class='material-icons'>update</i>
                        <p>Senaste</p>
                        <Show when={commentSort() == 'createdAt'}>
                        <i class='material-icons' id='current-sort-icon'>keyboard_double_arrow_down</i>
                        </Show>
                        <Show when={commentSort() == 'createdAt-inverse'}>
                        <i class='material-icons' id='current-sort-icon'>keyboard_double_arrow_up</i>
                        </Show>
                    </button>
                </div>
                <div class={styles.commentPageControl}>
                    <Show when={commentPage() > 1} fallback={
                        <button class={styles.editFeedIconButton} style="background-color: var(--color-white-m); cursor: unset;"><i class='material-icons'>navigate_before</i></button>
                    }>
                        <button class={styles.editFeedIconButton} onClick={() => {setCommentPage(commentPage() - 1); sortComments();}}><i class='material-icons'>navigate_before</i></button>
                    </Show>
                    <button class={styles.editFeedIconButton} style="cursor: unset;">Sida: {commentPage()}</button>
                    <Show when={commentPage() < commentPages()} fallback={
                        <button class={styles.editFeedIconButton} style="background-color: var(--color-white-m); cursor: unset;"><i class='material-icons'>navigate_next</i></button>
                    }>
                        <button class={styles.editFeedIconButton} onClick={() => {setCommentPage(commentPage() + 1); sortComments();}}><i class='material-icons'>navigate_next</i></button>
                    </Show>
                </div>
            </div>
        )
    }

    function CommentPageSelector() {
        return (
            <div class={styles.commentsControls} style={"justify-content: center;" + (commentPages() < 2 ? "display: none;" : "")}>
                <div class={styles.commentPageControl}>
                    <Show when={commentPage() > 1} fallback={
                        <button class={styles.editFeedIconButton} style="background-color: var(--color-white-m); cursor: unset;"><i class='material-icons'>navigate_before</i></button>
                    }>
                        <button class={styles.editFeedIconButton} onClick={() => {setCommentPage(commentPage() - 1); sortComments();}}><i class='material-icons'>navigate_before</i></button>
                    </Show>
                    <Show when={commentPages() < 15} fallback={
                        <>
                        {/* Make style work when there is alot of commentPages */}
                        <Show when={commentPage() <= 3}>
                            <For each={[... Array(3).keys()]}>{(v, i) =>
                            <PageButton v={v}/>
                            }</For>
                            <p>...</p>
                            <For each={[commentPages() - 1]}>{(v, i) =>
                            <PageButton v={v}/>
                            }</For>
                        </Show>
                        <Show when={commentPage() >= commentPages() - 3}>
                            <For each={[0]}>{(v, i) =>
                            <PageButton v={v}/>
                            }</For>
                            <p>...</p>
                            <For each={[commentPages() - 3, commentPages() - 2, commentPages() - 1]}>{(v, i) =>
                            <PageButton v={v}/>
                            }</For>
                        </Show>
                        <Show when={commentPage() < commentPages() - 3 && commentPage() > 3}>
                            <For each={[0]}>{(v, i) =>
                            <PageButton v={v}/>
                            }</For>
                            <p>...</p>
                            <For each={[commentPage() - 2, commentPage() - 1, commentPage()]}>{(v, i) =>
                            <PageButton v={v}/>
                            }</For>
                            <p>...</p>
                            <For each={[commentPages() - 1]}>{(v, i) =>
                            <PageButton v={v}/>
                            }</For>
                        </Show>
                        </>
                    }>
                        <For each={[... Array(commentPages()).keys()]}>{(v, i) =>
                        <PageButton v={v}/>
                        }</For>
                    </Show>
                    <Show when={commentPage() < commentPages()} fallback={
                        <button class={styles.editFeedIconButton} style="background-color: var(--color-white-m); cursor: unset;"><i class='material-icons'>navigate_next</i></button>
                    }>
                        <button class={styles.editFeedIconButton} onClick={() => {setCommentPage(commentPage() + 1); sortComments();}}><i class='material-icons'>navigate_next</i></button>
                    </Show>
                </div>
            </div>
        )
    }

    function Comment(props: {
        comment: any;
    }) {
        console.log(props.comment)
        
        const [likedByUser, setLikedByUser] = createSignal(props.comment.likes?.includes(JSON.parse(localStorage.getItem('profile'))?.result._id) || false)
        const [likeCount, setLikeCount] = createSignal(props.comment.likes?.length || 0)

        const profilePicture = `data:image/png;base64,${btoa(new Uint8Array(props.comment.creator.profilePicture.data.data).reduce(function (data, byte) {
            return data + String.fromCharCode(byte);
        }, ''))}`

        // console.log(props.comment.respondsTo?.__v)

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
                                // console.log(res.data)
                                setLikeCount(res.data.likes.length)
                                setLikedByUser(res.data.likes.includes(JSON.parse(localStorage.getItem('profile'))?.result._id))
                            })
                        }}>
                            <i class='material-icons' style={likedByUser() ? "color: var(--color-blue-l);" : "color: inherit;"}>thumb_up</i>
                            <span>{likeCount()}</span>
                        </button>
                        {/* <form action={"/forum/post/" + props.comment.onPost + "?comment=" + props.comment._id}>
                        <button class={styles.postLikeButton}>
                            <i class='material-icons'>comment</i>
                            <span>Svara</span>
                        </button>
                        </form> */}
                    </div>

                </div>
            </>
        )
    }

    return(
        <>
            <UserProfile />
            <div class={styles.userPosts}>
                <Switch>
                    <Match when={activeTab() === 'posts'}>
                        <PostControls />
                        <For each={userPosts()}>{post =>

                            <PostPreview data={post}/>
                        }</For>
                        <PostPageSelector />
                    </Match>
                    <Match when={activeTab() === 'comments'}>
                        <CommentControls />
                        <div class={styles.comments} id="comments">
                            <For each={comments()}>{comment =>

                                <Comment comment={comment}/>
                            }</For>
                        </div>
                        <CommentPageSelector />
                    </Match>
                    <Match when={activeTab() === 'about'}>
                        om personen
                    </Match>
                </Switch>
            </div>
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

function timeSince(date) {

    var seconds = Math.floor((new Date() - date) / 1000);

    var interval = seconds / 31536000;

    if (interval > 1) {
      return Math.floor(interval) + " år";
    }
    interval = seconds / 2592000;
    if (interval > 1) {
      return Math.floor(interval) + " månader";
    }
    interval = seconds / 86400;
    if (interval > 1) {
      return Math.floor(interval) + " dagar";
    }
    interval = seconds / 3600;
    if (interval > 1) {
      return Math.floor(interval) + " timmar";
    }
    interval = seconds / 60;
    if (interval > 1) {
      return Math.floor(interval) + " minuter";
    }
    return Math.floor(seconds) + " sekunder";
}