import { GetPost, NewComment } from "../api/posts"
import $ from "jquery"
import roleBadge from './StylingModules/RoleBadge.module.css'
import styles from './StylingModules/PostPreview.module.css'
import { For, Show } from "solid-js"

export default function Post(props: {
    post: string
}) {
    GetPost(props.post).then(res => {
        const post = res.data
        console.log(post)

        const profilePicture = `data:image/png;base64,${btoa(new Uint8Array(post.creator.profilePicture.data.data).reduce(function (data, byte) {
            return data + String.fromCharCode(byte);
        }, ''))}`

        $("#post-container").data("post-id", post._id)
        $("#post-title").html(post.title)
        $("#post-content").html(post.content)
        $("#post-likes").html(post.likes.length)
        $("#post-creator").append(<Creator profilePicture={profilePicture} creator={post.creator}/>)
        post.images.forEach(image => {
            $("#post-image-container").append(<Image imageData={image} />)
        });
        post.comments.forEach(comment => {
            $("#post-comments").append(<Comment comment={comment} />)
        });
    })
    return (
        <>
            <div class="post" id="post-container">
                <h1 class="title" id="post-title"></h1>
                <div class={styles.postCreator} id="post-creator" ></div>
                <p class="content" id="post-content"></p>
                <div class="image-container" id="post-image-container"></div>
                <span class="likes" id="post-likes"></span>
                <div class="comments" id="post-comments"></div>
                <form class="new-comment" onSubmit={e => e.preventDefault()} >
                    <input type="text" id="new-comment"/>
                    <button onClick={newComment}>Skicka</button>
                </form>
            </div>
        </>
    )
}

async function newComment() {
    const postId = $("#post-container").data("post-id")

    const content = $("#new-comment").val()

    const token = JSON.parse(localStorage.getItem('profile'))?.token

    await NewComment(postId, content, token)

    window.location.reload()
}

function Creator(props: {
    profilePicture: any;
    creator: any;
}) {
    return (
        <>
            <img class={styles.creatorImg} src={props.profilePicture} alt="" />
            <span class={styles.showRole}>
            {/* {props.roleRank >= 5 ? <i class='material-icons'>verified</i> : <></>} */}
            <i class={'material-icons ' + styles.verified} data={props.creator.role}>verified</i>
            <i class={roleBadge.role} data={props.creator.role}>{props.creator.role}</i>
            </span>
            <h2 class={styles.creatorName}>{props.creator.username}</h2>
        </>
    )
}

function Image(props: {
    imageData: any
}) {
    const image = `data:image/png;base64,${btoa(new Uint8Array(props.imageData.data.data).reduce(function (data, byte) {
        return data + String.fromCharCode(byte);
    }, ''))}`
    return (
        <>
            <img src={image} alt="" style="max-width: 300px;"/>
        </>
    )
}

function Comment(props: {
    comment: any;
}) {
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
            {/* <p>{props.comment.content}</p> */}
        </>
    )
}

const ShowRoleInPost = (props: {
    role: string;
}) => {
    return(
        <>
        <span class={styles.showRole}>
        {/* {props.roleRank >= 5 ? <i class='material-icons'>verified</i> : <></>} */}
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