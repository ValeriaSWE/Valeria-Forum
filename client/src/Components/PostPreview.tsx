import { createSignal, For, Show } from 'solid-js';
import { LikePost } from '../api/posts';
import styles from './StylingModules/PostPreview.module.css';
import roleBadge from './StylingModules/RoleBadge.module.css'

import $ from 'jquery';

export default function PostPreview(props: {
    minimal: boolean;
    data: {
        _id: string,
        title: string,
        creator: {
            _id: string,
            nicknames: [string],
            username: string,
            email: string,
            role: string,
            profilePicture: {
                _id: string,
                data: {
                    type: string,
                    data: [any]
                },
                contentType: string,
                __v: 0
            },
            joinedAt: "2022-09-17T21:17:11.403Z",
            __v: 0,
            roleRank: 10
        },
        "content": "testing again",
        "images": [
            "6334976fb333f38d7c9f0942"
        ],
        "comments": [],
        "likes": [],
        "pinned": false,
        "tags": [],
        "createdAt": "2022-09-28T18:50:23.373Z",
        "lastEditedAt": "2022-09-28T18:50:23.373Z",
        "__v": 6,
        "interactionCount": 0
    };
    // FÅR FIXAS SENARE :))
}) {
    console.log(props.data)
    const [likedByUser, setLikedByUser] = createSignal(props.data.likes.includes(JSON.parse(localStorage.getItem('profile'))?.result._id))
    const [likeCount, setLikeCount] = createSignal(props.data.likes.length)

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
        likes: [string];
        comments: number;
        postId: string;
        tags: [any]
    }) => {
        return (
            <>
            <div class={styles.postStatitics}>
                <For each={props.tags}>
                    {(tag, i) => 
                        <p class={styles.tag} style={"background-color: " + tag.color + ";"}>{tag.name}</p>
                    }
                </For>
                <p class={styles.postDate}>{ timeSince(new Date(props.date).getTime()) } sedan</p>
                <button onClick={() => {
                        LikePost(props.postId, JSON.parse(localStorage.getItem('profile'))?.token).then((res) => {
                            setLikeCount(res.data.likes.length)
                            setLikedByUser(res.data.likes.includes(JSON.parse(localStorage.getItem('profile'))?.result._id))
                        })
                        
                    }}>
                    <i class='material-icons' id={"likes-icon-" + props.postId} style={likedByUser() ? "color: var(--color-blue-l);" : "color: inherit;"}>thumb_up</i>
                    <span id={"likes-" + props.postId}>{likeCount()}</span>
                </button>
                <form action={"/forum/post/" + props.postId}>
                    <button>
                        <i class='material-icons'>comment</i>
                        {props.comments}
                    </button>
                </form>  
                <button><i class='material-icons'>more_horiz</i></button>  
            </div>
            </>
        )
    };

    const profilePicture = `data:image/png;base64,${btoa(new Uint8Array(props.data.creator.profilePicture.data.data).reduce(function (data, byte) {
        return data + String.fromCharCode(byte);
    }, ''))}`

   return(
    <>
    <div class={styles.post} id={props.data._id}>
        <div class={styles.postCreatorImg}>
            <img class={styles.profileImg} src={profilePicture} alt="" />
            <h2 class={styles.creatorName}>{props.data.creator.username}</h2>
            <Show when={props.data.creator.roleRank >= 5}>
                <ShowRoleInPost role={props.data.creator.role}/>
            </Show>
            {props.data.pinned ? <i class={styles.pinicon + " material-icons"}>push_pin</i> : <></>}
        </div>
        <a class={styles.postTitle} href={`/forum/post/${props.data._id}`} style="text-decoration: none;">
            <h2>{props.data.title}</h2>
            <p>{props.data.content}</p> 
        </a>
        <PostStatitics date={props.data.createdAt} likes={props.data.likes} comments={props.data.comments.length} postId={props.data._id} tags={props.data.tags}/>
    </div>
    </>
   )
}
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
