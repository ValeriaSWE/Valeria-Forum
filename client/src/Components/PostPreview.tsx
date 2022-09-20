import { Show } from 'solid-js';
import styles from './StylingModules/Post.module.css';

export default function PostPreview(props: {
    minimal: boolean;
    data: any;
    // FÅR FIXAS SENARE :))
}) {
    const ShowRoleInPost = (props: {
        role: string;
    }) => {
        return(
            <>
            <span class={styles.showRole}>
            {/* {props.roleRank >= 5 ? <i class='material-icons'>verified</i> : <></>} */}
            <i class={'material-icons ' + styles.verified}>verified</i>
            <i class={styles.role} data={props.role}>{props.role}</i>
            </span>
            </>
        )
    }
    
    const PostStatitics = (props: {
        date: string;
        likes: number;
        comments: number;
    }) => {
        const date = timeSince(new Date(props.date).getTime())

        return (
            <>
            <div class={styles.postStats}>
                <p class={styles.date}>{date}</p>
                 <button>
                <i class='material-icons'>thumb_up</i>
                {props.likes} Likes</button>  
                <button>
                <i class='material-icons'>comment</i>
                {props.comments} Kommentarer</button>
                <button>
                <i class='material-icons'>share</i>
                dela</button>  
            </div>

            </>
        )
       
    };

    const profilePicture = `data:image/png;base64,${btoa(new Uint8Array(props.data.creator.profilePicture.data.data).reduce(function (data, byte) {
        return data + String.fromCharCode(byte);
    }, ''))}`

    return(
    <>
    <div class={styles.post}>
        <div class={styles.postCreator}> 
            <img class={styles.creatorImg} src={profilePicture} alt="" />
            <Show when={props.data.creator.roleRank >= 5}>
                <ShowRoleInPost role={props.data.creator.role}/>
            </Show>
            <h2 class={styles.creatorName}>{props.data.creator.username}</h2>
        </div>
        <div class={styles.feedTitle}>
            {props.data.pinned ? <i class={styles.pinicon + " " + "material-icons"}>push_pin</i> : <></>}
            <p>{props.data.title}</p> 
        </div>
        <PostStatitics date={props.data.createdAt} likes={props.data.likes.length} comments={props.data.comments.length}/>
    </div>
    </>)
    ;
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
//   var aDay = 24*60*60*1000;
//   console.log(timeSince(new Date(Date.now()-aDay)));
//   console.log(timeSince(new Date(Date.now()-aDay*2)));