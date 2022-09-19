import styles from './StylingModules/Post.module.css';

export default function Post(props: {
    data: any;
    // FÅR FIXAS SENARE :))
}) {
    const ShowRoleInPost = () => {
        return(
            <>
            <span class={styles.showRole}>
            <i class={styles.role}>Dev</i>
            <i class={styles.pinicon + " " + "material-icons"}>push_pin</i>
            </span>
            </>
        )
    }
    
    const PostStatitics = () => {
        return (
            <>
            <div class={styles.postStats}>
                <p class={styles.date}>3 timmar sedan</p>
                 <button>
                <i class='material-icons'>thumb_up</i>
                40 Likes</button>  
                <button>
                <i class='material-icons'>comment</i>
                9 Kommentarer</button>
                <button>
                <i class='material-icons'>share</i>
                dela</button>  
            </div>

            </>
        )
       
    };
    return(
    <>
    <div class={styles.post}>
        <div class={styles.postCreator}> 
            <img class={styles.creatorImg} src="https://media.discordapp.net/attachments/1016102274667401278/1020440269176459375/AF2594FE-8DB2-41F9-BD5E-B9102D3967B1.jpg" alt="" />
            <h2 class={styles.creatorName}>Grizly</h2>
        </div>
        <div class={styles.feedTitle}>
            {props.data.pinned && <ShowRoleInPost />}
            <p>{props.data.title}</p> 
        </div>
        <PostStatitics />
    </div>
    </>)
    ;
}