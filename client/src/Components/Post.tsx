import { EditPost, GetAllowedTags, GetImage, GetPost, LikeComment, LikePost, NewComment } from "../api/posts"
import $ from "jquery"
import roleBadge from './StylingModules/RoleBadge.module.css'
import styles from './StylingModules/Post.module.css'
import { createSignal, For, Index, Show } from "solid-js"
import { useLocation } from "solid-app-router"
import SolidMarkdown from "solid-markdown"
import Highlight from "solid-highlight"
import { CheckAuthLevel } from "../functions/user"
import { timeSince } from "./UserInfo"
import { createStore } from "solid-js/store";

// import "highlight.js/styles/tokyo-night-dark.css"
// import "highlight.js/styles/devibeans.css"
// import "highlight.js/styles/tokyo-night-light.css"

export default function Post(props: {
    post: string
}) {
    const search = useLocation().search
    const searchParams = new URLSearchParams(search)

    const [post, setPost] = createStore({
        _id: "637950a1c8cd683ef8be6c1a",
        title: "title",
        creator: {
            nicknames: [],
            username: "username",
            role: "pleb",
            creatorPfp: {
                data: {
                    type: "Buffer",
                    data: "none"
                },
                contentType: "image/png",
            },
            roleRank: 0,
            _id: "id"
        },
        content: "",
        images: [],
        isEdited: false,
        comments: [],
        likes: [],
        pinned: false,
        tags: [
            {
                color: "gold",
                minRank: 10,
                name: "Nyhet",
            }
        ],
        likeCount: 0,
        likedByUser: false,
        createdDate: "0 second sedan"
    })

    const [isEditing, setIsEditing] = createSignal(false)
    const [tags, setTags] = createStore([]) // All available tags (for when editing)

    const [newCommentRespondsTo, setNewCommentRespondsTo] = createSignal(null)

    // Comment signals:
    const [comments, setComments] = createSignal([])
    const [commentSort, setCommentSort] = createSignal(searchParams.get('commentSort') || "createdAt")
    const [commentPage, setCommentPage] = createSignal(parseInt(searchParams.get('commentPage') || "1"))
    const [commentPages, setCommentPages] = createSignal(1)
    const [commentPageDict, setCommentPageDict] = createSignal({})
    const [commentLimit, setCommentLimit] = createSignal(parseInt(searchParams.get('commentLimit') || "10"))

/* A function that is called when the component is mounted. It is fetching data from an API and then
setting the data to the state. */
    GetPost(props.post, commentSort(), commentPage() - 1, commentLimit()).then(res => {
        const { commentPages, commentPageDict } = res.data
        const postData =  res.data.post
        setPost({...postData, createdDate: timeSince(new Date(postData.createdAt).getTime()), likeCount: postData.likes.length, likedByUser: postData.likes.includes(JSON.parse(localStorage.getItem('profile'))?.result._id), pfpRaw: postData.creator.profilePicture, creatorPfp: `data:image/png;base64,${btoa(new Uint8Array(postData.creator.profilePicture.data.data).reduce(function (data, byte) {
            return data + String.fromCharCode(byte);
        }, ''))}`})

        setCommentPages(commentPages)
        setCommentPageDict(commentPageDict)

        setComments(postData.comments)

        if (searchParams.get('comment')) {
            highlightPost(searchParams.get('comment'))
        }
    })

    /**
     * Send create new comment axios Post to server and recieve updated comment list
     */
    async function newComment() {
        const postId = props.post

        if (!$("#new-comment").val()) return

        const content = urlify($("#new-comment").val()?.toString())

        const respondsTo = newCommentRespondsTo()?._id

        setNewCommentRespondsTo(null)

        $("#new-comment").val("")

        const token = JSON.parse(localStorage.getItem('profile'))?.token

        const { data } = await NewComment(postId, content, respondsTo, token)

        setComments(data.comments)
        // setCommentsAmount(data.comments.length)

        $('html, body').scrollTop($('#' + data.comments[data.comments.length - 1]._id).offset()?.top)
    }

    function Creator() {
        return (
            <a class={styles.creatorContainer} href={"/forum/user/" + post.creator._id}>
                <div class={styles.creatorImg}>
                    <img src={post.creatorPfp} alt="" />
                    <i class={'material-icons ' + styles.verified} data={post.creator.role}>verified</i>
                </div>
                <h2 class={styles.creatorName}>{post.creator.username}</h2>
                <i class={roleBadge.role} data={post.creator.role}>{post.creator.role}</i>
            </a>
        )
    }

    function Comment(props: {
        comment: any;
    }) {
        const [likedByUser, setLikedByUser] = createSignal(props.comment.likes.includes(JSON.parse(localStorage.getItem('profile'))?.result._id))
        const [likeCount, setLikeCount] = createSignal(props.comment.likes.length)

        const profilePicture = `data:image/png;base64,${btoa(new Uint8Array(props.comment.creator.profilePicture.data.data).reduce(function (data, byte) {
            return data + String.fromCharCode(byte);
        }, ''))}`

        return(
            <>
                <div class={styles.postComment} id={props.comment._id}>
                    <Show when={props.comment.respondsTo}>
                        <a onClick={() => highlightPost(props.comment.respondsTo._id)} class={styles.respondsTo}>
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



                    <div class={styles.feedTitle}>
                        <SolidMarkdown>{props.comment.content}</SolidMarkdown>
                    </div>

                    <div class={styles.commentStatitics}>
                        <PostStatitics date={props.comment.createdAt} />
                        <button class={styles.postLikeButton} onClick={() => {
                            LikeComment(props.comment._id, JSON.parse(localStorage.getItem('profile'))?.token).then((res) => {
                                setLikeCount(res.data.likes.length)
                                setLikedByUser(res.data.likes.includes(JSON.parse(localStorage.getItem('profile'))?.result._id))
                            })
                        }}>
                            <i class='material-icons' style={post.likedByUser ? "color: var(--color-blue-l);" : "color: inherit;"}>thumb_up</i>
                            <span>{post.likeCount}</span>
                        </button>
                        <button class={styles.postLikeButton} onClick={() => setNewCommentRespondsTo(props.comment)}>
                            <i class='material-icons'>comment</i>
                            <span>Svara</span>
                        </button>
                    </div>

                </div>
            </>
        )
    }

    async function sortComments() {
        const res = await GetPost(props.post, commentSort(), commentPage() - 1, commentLimit())
        const { post, commentPages } = res.data

        setCommentPages(commentPages)
        setComments(post.comments)
        // })
    }

    function PageButton(props: {
        v: number
    }) {
        const v = props.v

        return (
            <Show when={v + 1 == commentPage()} fallback={
                <button class={styles.editFeedIconButton} onClick={() => {setCommentPage(v + 1); sortComments();}}>{v + 1}</button>
            }>
                <button class={styles.editFeedIconButton} style="cursor: unset; background-color: var(--color-white-m);">{v + 1}</button>
            </Show>
        )
    }

    async function highlightPost(post: string) {
        const page = commentPageDict()[post] || 1

        if (page && page != commentPage()) {
            setCommentPage(page)
            await sortComments()
        }

        $('html, body').scrollTop($('#' + post).offset()?.top - $( window ).height()/2)
        setTimeout(function() {

            
            $('#' + post).addClass(styles.highlight)
            // $('#' + post).css({'background-size': '0%'})
            // $('#' + post).css({'background-repeat': 'no-repeat'})
            // $('#' + post).css({'background-position': '50% 0'})
            // $('#' + post).css({backgroundImage: 'radial-gradient(circle at center, transparent calc(var(--highlight) - 2%), var(--color-blue-l) var(--highlight), var(--color-blue-l) calc(var(--highlight) + 4%), transparent calc(var(--highlight) + 6%))'})
            // $('#' + post).animate({'background-size': '120%'}, 500)
            // $('#' + post).animate({borderWidth: '0px'}, 250)
            // $('#' + post).animate({scale: '103%'}, 250)
            // $('#' + post).animate({scale: '100%'}, 250)
        }, 500)

    }
//     const TEST_STRING = `
//     Will match the following cases

// # [fofu](http://www.foufos.gr)
//         https://www.foufos.gr
//         http://foufos.gr
//         http://www.foufos.gr/kino
//         http://werer.gr
//         www.foufos.gr
//         www.mp3.com
//         www.t.co
//         http://t.co
//         http://www.t.co
//         https://www.t.co
//         www.aa.com
//         http://aa.com
//         http://www.aa.com
//         https://www.aa.com

//     Will NOT match the following

//         www.foufos
//         www.foufos-.gr
//         www.-foufos.gr
//         foufos.gr
//         http://www.foufos
//         http://foufos
//         www.mp3#.com
//   `;


    async function savePost() {
        let activeTags: string[] = []
        tags.forEach(tag => {
            if (tag.selected) {
                activeTags.push(tag._id)
            }
        });
        const newPostData = await EditPost(props.post, $('#editContent').val()?.toString(), activeTags, JSON.parse(localStorage.getItem('profile'))?.token)

        setPost({...post, content: newPostData.data.content, isEdited: newPostData.data.isEdited, tags: newPostData.data.tags})

        setIsEditing(false)
    }
      
    function EditPostView() {

        GetAllowedTags(JSON.parse(localStorage.getItem('profile'))?.token || "").then(res => {
            const {data} = res
            setTags([])
            for (let i = 0; i < data.length; i++) {
                setTags([...tags, {...data[i], selected: findTag(data[i]._id), id: i}])
            }
        })

        function findTag(tagId) {
            for (let i = 0; i < post.tags.length; i++) {
                if (post.tags[i]._id == tagId) {
                    return true
                }
            }
            return false
        }

        function setTagActive(tagId: number, state: boolean) {
            setTags(tag => tag.id === tagId, 'selected', selected => state)
        }
        return (
            <div class={styles.postContent}>
                <div class={styles.pickedTags}>
                    <p>Valda taggar:</p>
                    <For each={tags}>{(tag, i) =>
                        <Show when={tag.selected}>
                            <button style={"background-color: " + tag.color} class={styles.tag} onClick={() => setTagActive(tag.id, false)}>{tag.name} X</button>
                        </Show>
                    }</For>
                </div>
                <div class={styles.notPickedTags}>
                    <p>Välj taggar:</p>
                    <For each={tags}>{(tag) =>
                        <Show when={!tag.selected}>
                            <button style={"background-color: " + tag.color} class={styles.tag} onClick={() => setTagActive(tag.id, true)}>{tag.name}</button>
                        </Show>
                    }</For>
                </div>
                <h1 class={styles.title} id="post-title">{post.title}</h1>
                {/* https://codepen.io/chriscoyier/pen/XWKEVLy */}
                <div class={styles.growWrap} data-replicated-value={post.content}>
                    <textarea class={styles.contentEditing} value={post.content} id="editContent" onInput="this.parentNode.dataset.replicatedValue = this.value" onKeyDown={(e) => {if (e.ctrlKey && e.key === 's') {e.preventDefault(); savePost()}}}></textarea>
                </div>
                <div class={styles.imageContainer} id="post-image-container">
                    <For each={post.images}>{image =>
                        <Image imageData={image} />
                    }</For>
                </div>
            </div>
        )
    }

    function PostView() {
        return (
            <div class={styles.postContent}>
                <div class={styles.tags}>
                    <For each={post.tags}>
                        {(tag, i) => 
                            <p class={styles.tag} style={"background-color: " + tag.color + ";"}>{tag.name}</p>
                        }
                    </For>
                </div>
                <h1 class={styles.title} id="post-title">{post.title}</h1>
                <p class={styles.content} id="post-content">
                    <Show when={post.content}>
                        <SolidMarkdown components={{
                            code({node, inline, className, children, ...props}) {
                                const match = /language-(\w+)/.exec(className || '')
                                return !inline && match ? (
                                <Highlight
                                    children={String(children).replace(/\n$/, '')}
                                    language={match[1]}
                                    autoDetect={false}
                                    {...props}
                                />
                                ) : (
                                <code class={className} {...props}>
                                    {children}
                                </code>
                                )
                            }}
                            }>{post.content}</SolidMarkdown>
                    </Show>
                </p>
                <div class={styles.imageContainer} id="post-image-container">
                    <For each={post.images}>{image =>
                        <Image imageData={image} />
                    }</For>
                </div>
            </div>
        )
    }

    function PostDisplay() {
        return (
            <div class={styles.inheritPost}>
                <div class={styles.postCreator} id="post-creator">
                    <Creator/>
                    <Show when={post.creator._id == JSON.parse(localStorage.getItem('profile'))?.result._id && CheckAuthLevel(JSON.parse(localStorage.getItem('profile'))?.token, 0)}>
                        <button class={styles.editBtn} onClick={async () => {
                            if (isEditing()) {
                                savePost()
                            } else {
                                setIsEditing(true)
                            }

                        }}>{isEditing() ? "Spara" : "Ändra"}</button>
                    </Show>
                    {/* POST  */}
                    <p class={styles.postDate}>{post.createdDate} sedan</p>
                    <Show when={post.isEdited}>
                        <span class={styles.editedBadge}>(Redigerad)</span>
                    </Show>
                </div>
                <Show when={isEditing()} fallback={<PostView />}>
                    <EditPostView />
                </Show>
                <div class={styles.postStatistics}>
                    <button class={styles.postLikeButton} onClick={() => {
                            LikePost(props.post, JSON.parse(localStorage.getItem('profile'))?.token).then((res) => {
                                setLikeCount(res.data.likes.length)
                                setLikedByUser(res.data.likes.includes(JSON.parse(localStorage.getItem('profile'))?.result._id))
                            })

                        }}>
                        <i class='material-icons' id={"likes-icon-" + props.post} style={post.likedByUser ? "color: var(--color-blue-l);" : "color: inherit;"}>thumb_up</i>
                        <span id={"likes-" + props.post}>{post.likeCount} Likes</span>
                    </button>
                    <button>
                    <i class='material-icons'>share</i>
                    <span>dela</span>
                    </button>

                </div>
            </div>
        )
    }

    function NewCommentCreation() {
        return (
            <div class={styles.newCommentForm}>
                <Show when={newCommentRespondsTo()}>
                    <a onClick={() => highlightPost(newCommentRespondsTo()?._id)} class={styles.respondsTo}>
                        <i class="material-icons">reply</i><p>@{newCommentRespondsTo().creator.username} {newCommentRespondsTo().content}</p>
                        <button class={styles.cancelResponse} onClick={() => {setNewCommentRespondsTo(null)}}>X</button>
                    </a>
                </Show>
                <form onSubmit={e => e.preventDefault()} >
                    <input type="text" class={styles.newCommentInput} id="new-comment" autocomplete="off" placeholder="Skriv en kommentar"/>
                    <button class={styles.postCommentButton} onClick={newComment}>
                        <h4>Pulicera</h4>
                        <i class="material-icons">send</i>
                    </button>
                </form>
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

    function CommentsList() {

        return (
            <div class={styles.comments} id="comments">
                <For each={comments()}>{comment =>
                    <Comment comment={comment} />
                }</For>
            </div>
        )
    }

    return (
        <>
            <PostDisplay />

            <NewCommentCreation />

            <CommentControls />

            <CommentsList />

            <CommentPageSelector />
        </>
    )
}

function Image(props: {
    imageData: any
}) {
    const [image, setImage] = createSignal('')

    GetImage(props.imageData).then(img => {
        setImage(`data:image/png;base64,${btoa(new Uint8Array(img.data.data.data).reduce(function (data, byte) {
            return data + String.fromCharCode(byte);
        }, ''))}`)
    })

    return (
        <>
            <img src={image()} alt=""/>
        </>
    )
}

// const ShowRoleInPost = (props: {
//     role: string;
// }) => {
//     return(
//         <>
//         <span class={styles.showRole}>
//         <i class={'material-icons ' + styles.verified} data={props.role}>verified</i>
//         <i class={roleBadge.role} data={props.role}>{props.role}</i>
//         </span>
//         </>
//     )
// }

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

 /**
  * Converts a date object to human readable time since string. eg. "3 timmar sedan"
  * @param date - date object to convert
  * @returns - human readable time since date
  */
// function timeSince(date) {

//     var seconds = Math.floor((new Date() - date) / 1000);

//     var interval = seconds / 31536000;

//     if (interval > 1) {
//       return Math.floor(interval) + " år";
//     }
//     interval = seconds / 2592000;
//     if (interval > 1) {
//       return Math.floor(interval) + " månader";
//     }
//     interval = seconds / 86400;
//     if (interval > 1) {
//       return Math.floor(interval) + " dagar";
//     }
//     interval = seconds / 3600;
//     if (interval > 1) {
//       return Math.floor(interval) + " timmar";
//     }
//     interval = seconds / 60;
//     if (interval > 1) {
//       return Math.floor(interval) + " minuter";
//     }
//     return Math.floor(seconds) + " sekunder";
// }

// https://stackoverflow.com/questions/1500260/detect-urls-in-text-with-javascript
// https://regexr.com/
function urlify(text: string) {
    var urlRegex = /(?<!\]\()(http:\/\/|https:\/\/)[a-zA-Z0-9._+-]+\.[a-z]+[a-zA-Z0-9\/._+-]+/g;
    return (text.replace(urlRegex, function(url: string) {
            return ( `[${url.split('/')[2]}](${url})` )
        }))
}