import styles from './StylingModules/Feed.module.css';
import { splitProps, JSX } from 'solid-js';
import Post from './Post';
export default function Feed() {
  



  function FeedContainer(props: {children: any}) {
    return(
    <>
    <div class={styles.feed}>
    {props.children}
    </div>
    </>)
  }
  
  function EditFeedResult() {
    return(
    <>
    <div class={styles.editFeed}>
      <div>
          <div class={styles.editFeedIconButton}>
            <i class='material-icons'>group</i>
            <p>Följer</p>
          </div>
          <div class={styles.editFeedIconButton}>        
            <i class='material-icons'>whatshot</i>
            <p>Populärt</p>
          </div>
          <div class={styles.editFeedIconButton}>        
            <i class='material-icons'>sync</i>
            <p>Senaste</p>
          </div>
        </div>
        <div class={styles.searchFeed}>        
            <i class='material-icons'>search</i>
            <input type="text" placeholder='Sök efter Feed' />
          </div>
      <div>
      </div>
    </div>
    </>)
  }


  function Posts(prosps: {children: any}) {
   

    return(
      <>
      <div class={styles.posts}>
        {prosps.children}
      </div>
      </>
    )
  }

  return(
  <>
  <Post data={{pinned: true, title: "Server updatering v2"}}></Post>
  <Post data={{pinned: true, title: "Forum updatering v2 test test test test test test test test test test test test test test test "}}></Post>
  <FeedContainer>
    <EditFeedResult />
  </FeedContainer>
  </>)
}