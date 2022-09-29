import { GetImage, GetPost, LikePost, NewComment } from "../api/posts"
import $ from "jquery"
import roleBadge from './StylingModules/RoleBadge.module.css'
import styles from './StylingModules/Post.module.css'
import { createSignal, For, Show } from "solid-js"

export default function Post(props: {
    post: string
}) {
    const [title, setTitle] = createSignal('title')
    const [content, setContent] = createSignal('content')
    const [creator, setCreator] = createSignal({username: "username", role: "role"})
    const [images, setImages] = createSignal([])
    const [comments, setComments] = createSignal([])
    // const [tags, setTags] = createSignal([])
    const [likeCount, setLikeCount] = createSignal(0)
    const [likedByUser, setLikedByUser] = createSignal(false)
    const [creatorPfp, setCreatorPfp] = createSignal('')

/* A function that is called when the component is mounted. It is fetching data from an API and then
setting the data to the state. */
    GetPost(props.post).then(res => {
        const { data } = res
        
        setTitle(data.title)
        setCreator(data.creator)
        setContent(data.content)

        const profilePicture = `data:image/png;base64,${btoa(new Uint8Array(data.creator.profilePicture.data.data).reduce(function (data, byte) {
            return data + String.fromCharCode(byte);
        }, ''))}`
        setCreatorPfp(profilePicture)
        setImages(data.images)
        setLikeCount(data.likes.length)
        setLikedByUser(data.likes.includes(JSON.parse(localStorage.getItem('profile'))?.result._id))
        setComments(data.comments)
    })

    /**
     * Send create new comment axios Post to server and recieve updated comment list
     */
    async function newComment() {
        const postId = props.post
    
        const content = $("#new-comment").val()
    
        const token = JSON.parse(localStorage.getItem('profile'))?.token
    
        const { data } = await NewComment(postId, content, token)
    
        setComments(data.comments)
    }

    function Creator() {
        return (
            <>
                <img class={styles.creatorImg} src={creatorPfp()} alt="" />
                <span class={styles.showRole}>
                <i class={'material-icons ' + styles.verified} data={creator().role}>verified</i>
                <i class={roleBadge.role} data={creator().role}>{creator().role}</i>
                </span>
                <h2 class={styles.creatorName}>{creator().username}</h2>
            </>
        )
    }

    return (
        <>
            <div class="post" id="post-container">
                <h1 class="title" id="post-title">{title()}</h1>
                <div class={styles.postCreator} id="post-creator" ><Creator creator={creator()}/></div>
                <p class="content" id="post-content">{content}</p>
                <div class="image-container" id="post-image-container">
                    <For each={images()}>{image =>
                        <Image imageData={image} />
                    }</For>
                </div>
                <button onClick={() => {
                        LikePost(props.post, JSON.parse(localStorage.getItem('profile'))?.token).then((res) => {
                            setLikeCount(res.data.likes.length)
                            setLikedByUser(res.data.likes.includes(JSON.parse(localStorage.getItem('profile'))?.result._id))
                        })
                        
                    }}>
                    <i class='material-icons' id={"likes-icon-" + props.post} style={likedByUser() ? "color: var(--color-blue-l);" : "color: inherit;"}>thumb_up</i>
                    <span id={"likes-" + props.post}>{likeCount()}</span>
                </button>
                <form class="new-comment" onSubmit={e => e.preventDefault()} >
                    <input type="text" id="new-comment"/>
                    <button onClick={newComment}>Skicka</button>
                </form>
                <div class="comments" id="post-comments">
                    <For each={comments()}>{comment =>
                        <Comment comment={comment} />
                    }</For>
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
            <img src={image()} alt="" style="max-width: 300px;"/>
        </>
    )
}

function Comment(props: {
    comment: any;
}) {
    console.log(props.comment)
    const profilePicture = `data:image/png;base64,${btoa(new Uint8Array(props.comment.creator.profilePicture.data.data).reduce(function (data, byte) {
        return data + String.fromCharCode(byte);
    }, ''))}`

    return(
        <>
            <div class={styles.post}>
                <div class={styles.postCreator}> 
                    <img class={styles.creatorImg} src={profilePicture} alt="" />
                    <Show when={props.comment.creator.roleRank >= 5}>
                        <ShowRoleInPost role={props.comment.creator.role}/>
                    </Show>
                    <h2 class={styles.creatorName}>{props.comment.creator.username}</h2>
                </div>
                <div class={styles.feedTitle}>
                    <p>{props.comment.content}</p> 
                </div>
                <PostStatitics date={props.comment.createdAt} />
            </div>
        </>
    )
}

const ShowRoleInPost = (props: {
    role: string;
}) => {
    return(
        <>
        <span class={styles.showRole}>
        <i class={'material-icons ' + styles.verified} data={props.role}>verified</i>
        <i class={roleBadge.role} data={props.role}>{props.role}</i>
        </span>
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