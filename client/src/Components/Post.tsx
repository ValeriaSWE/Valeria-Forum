import { EditPost, GetImage, GetPost, LikeComment, LikePost, NewComment } from "../api/posts"
import $ from "jquery"
import roleBadge from './StylingModules/RoleBadge.module.css'
import styles from './StylingModules/Post.module.css'
import { createSignal, For, Index, Show } from "solid-js"
import { useLocation } from "solid-app-router"
import SolidMarkdown from "solid-markdown"
import Highlight from "solid-highlight"
import { CheckAuthLevel } from "../functions/user"

// import "highlight.js/styles/tokyo-night-dark.css"
// import "highlight.js/styles/devibeans.css"
// import "highlight.js/styles/tokyo-night-light.css"

export default function Post(props: {
    post: string
}) {
    const search = useLocation().search
    const searchParams = new URLSearchParams(search)

    const [isEditing, setIsEditing] = createSignal(false)

    // main post signals:
    const [title, setTitle] = createSignal('title')
    const [content, setContent] = createSignal('')
    const [creator, setCreator] = createSignal({username: "username", role: "role"})
    const [images, setImages] = createSignal([])
    const [likeCount, setLikeCount] = createSignal(0)
    const [likedByUser, setLikedByUser] = createSignal(false)
    const [creatorPfp, setCreatorPfp] = createSignal('')
    const [createdDate, setCreatedDate] = createSignal("time")
    const [isEdited, setIsEdited] = createSignal(false)

    const [newCommentRespondsTo, setNewCommentRespondsTo] = createSignal(null)

    // Comment signals:
    const [comments, setComments] = createSignal([])
    const [commentsAmount, setCommentsAmount] = createSignal(0)
    const [commentSort, setCommentSort] = createSignal(searchParams.get('commentSort') || "createdAt")
    const [commentPage, setCommentPage] = createSignal(parseInt(searchParams.get('commentPage') || "1"))
    const [commentPages, setCommentPages] = createSignal(1)
    const [commentLimit, setCommentLimit] = createSignal(parseInt(searchParams.get('commentLimit') || "10"))

/* A function that is called when the component is mounted. It is fetching data from an API and then
setting the data to the state. */
    GetPost(props.post, commentSort(), commentPage() - 1, commentLimit()).then(res => {
        const { post, commentPages } = res.data

        setCommentPages(commentPages)

        setTitle(post.title)
        setCreator(post.creator)
        setContent(post.content)

        const profilePicture = `data:image/png;base64,${btoa(new Uint8Array(post.creator.profilePicture.data.data).reduce(function (data, byte) {
            return data + String.fromCharCode(byte);
        }, ''))}`
        setCreatorPfp(profilePicture)
        setImages(post.images)
        setLikeCount(post.likes.length)
        setLikedByUser(post.likes.includes(JSON.parse(localStorage.getItem('profile'))?.result._id))
        setComments(post.comments)
        setCommentsAmount(post.comments.length)
        setCreatedDate(timeSince(new Date(post.createdAt).getTime()))
        setIsEdited(post.isEdited)
    })

    /**
     * Send create new comment axios Post to server and recieve updated comment list
     */
    async function newComment() {
        const postId = props.post

        if (!$("#new-comment").val()) return

        // console.log(urlify($("#new-comment").val()?.toString()))

        const content = urlify($("#new-comment").val()?.toString())
        // const content = $("#new-comment").val()

        const respondsTo = newCommentRespondsTo()?._id

        setNewCommentRespondsTo(null)

        $("#new-comment").val("")

        const token = JSON.parse(localStorage.getItem('profile'))?.token

        const { data } = await NewComment(postId, content, respondsTo, token)

        // console.log(data)

        setComments(data.comments)
        setCommentsAmount(data.comments.length)

        $('html, body').scrollTop($('#' + data.comments[data.comments.length - 1]._id).offset()?.top)
    }

    function Creator() {
        return (
            <a class={styles.creatorContainer} href={"/forum/user/" + creator()._id}>
                <div class={styles.creatorImg}>
                    <img src={creatorPfp()} alt="" />
                    <i class={'material-icons ' + styles.verified} data={creator().role}>verified</i>
                </div>
                <h2 class={styles.creatorName}>{creator().username}</h2>
                <i class={roleBadge.role} data={creator().role}>{creator().role}</i>
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

        // console.log(props.comment.respondsTo?.__v)

        return(
            <>
                <div class={styles.postComment} id={props.comment._id}>
                    <Show when={props.comment.respondsTo}>
                        <a onClick={() => highlightPost(props.comment.respondsTo._id, props.comment.respondsTo.__v)} class={styles.respondsTo}>
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
                                // console.log(res.data)
                                setLikeCount(res.data.likes.length)
                                setLikedByUser(res.data.likes.includes(JSON.parse(localStorage.getItem('profile'))?.result._id))
                            })
                        }}>
                            <i class='material-icons' style={likedByUser() ? "color: var(--color-blue-l);" : "color: inherit;"}>thumb_up</i>
                            <span>{likeCount()}</span>
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
    // console.log(JSON.parse(localStorage.getItem('profile'))?.result._id)

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

    async function highlightPost(post: string, page: number | null) {
        var wait = 0

        if (page && page != commentPage()) {
            setCommentPage(page)
            await sortComments()
        }

        $('html, body').scrollTop($('#' + post).offset()?.top - $( window ).height()/2)
        setTimeout(function() {

            $('#' + post).animate({scale: '103%'}, 250)
            $('#' + post).animate({scale: '100%'}, 250)
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
        const newPostData = await EditPost(props.post, $('#editContent').val()?.toString(), JSON.parse(localStorage.getItem('profile'))?.token)

        // console.log(newPostData)

        setContent(newPostData.data.content)
        setIsEdited(newPostData.data.isEdited)

        setIsEditing(false)
    }
      
    return (
        <>
            <div class={styles.inheritPost}>
                <div class={styles.postCreator} id="post-creator">
                    <Creator/>
                    <Show when={creator()._id == JSON.parse(localStorage.getItem('profile'))?.result._id && CheckAuthLevel(JSON.parse(localStorage.getItem('profile'))?.token, 0)}>
                        <button class={styles.editBtn} onClick={async () => {
                            if (isEditing()) {
                                savePost()
                            } else {
                                setIsEditing(true)
                            }

                        }}>{isEditing() ? "Spara" : "Ändra"}</button>
                    </Show>
                    {/* POST  */}
                    <p class={styles.postDate}>{createdDate()} sedan</p>
                    <Show when={isEdited()}>
                        <span class={styles.editedBadge}>(Redigerad)</span>
                    </Show>
                </div>
                <Show when={isEditing()} fallback={
                    <div class={styles.postContent}>
                        <h1 class={styles.title} id="post-title">{title()}</h1>
                        <p class={styles.content} id="post-content">
                            <Show when={content()}>
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
                                    }>{content()}</SolidMarkdown>
                            </Show>
                        </p>
                        <div class={styles.imageContainer} id="post-image-container">
                            <For each={images()}>{image =>
                                <Image imageData={image} />
                            }</For>
                        </div>
                    </div>
                }>
                    <div class={styles.postContent}>
                        <h1 class={styles.title} id="post-title">{title()}</h1>
                        {/* https://codepen.io/chriscoyier/pen/XWKEVLy */}
                        <div class={styles.growWrap} data-replicated-value={content()}>
                            <textarea class={styles.contentEditing} value={content()} id="editContent" onInput="this.parentNode.dataset.replicatedValue = this.value" onKeyDown={(e) => {if (e.ctrlKey && e.key === 's') {e.preventDefault(); savePost()}}}></textarea>
                        </div>
                        <div class={styles.imageContainer} id="post-image-container">
                            <For each={images()}>{image =>
                                <Image imageData={image} />
                            }</For>
                        </div>
                    </div>
                </Show>
                <div class={styles.postStatistics}>
                    <button class={styles.postLikeButton} onClick={() => {
                            LikePost(props.post, JSON.parse(localStorage.getItem('profile'))?.token).then((res) => {
                                setLikeCount(res.data.likes.length)
                                setLikedByUser(res.data.likes.includes(JSON.parse(localStorage.getItem('profile'))?.result._id))
                            })

                        }}>
                        <i class='material-icons' id={"likes-icon-" + props.post} style={likedByUser() ? "color: var(--color-blue-l);" : "color: inherit;"}>thumb_up</i>
                        <span id={"likes-" + props.post}>{likeCount()} Likes</span>
                    </button>
                    <button>
                    <i class='material-icons'>share</i>
                    <span>dela</span>
                    </button>

                </div>
            </div>

            <div class={styles.newCommentForm}>
                <Show when={newCommentRespondsTo()}>
                    <a onClick={() => highlightPost(newCommentRespondsTo()?._id, null)} class={styles.respondsTo}>
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


            <div class={styles.comments} id="comments">
                <For each={comments()}>{comment =>
                    <Comment comment={comment} />
                }</For>
            </div>

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

// https://stackoverflow.com/questions/1500260/detect-urls-in-text-with-javascript
// https://regexr.com/
function urlify(text: string) {
    var urlRegex = /(?<!\]\()(http:\/\/|https:\/\/)[a-zA-Z0-9._+-]+\.[a-z]+[a-zA-Z0-9\/._+-]+/g;
    return (text.replace(urlRegex, function(url: string) {
            // console.log(url.split('/')[2])
            return ( `[${url.split('/')[2]}](${url})` )
        }))
    // or alternatively
    // return text.replace(urlRegex, '<a href="$1">$1</a>')
}