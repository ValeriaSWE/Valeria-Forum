import styles from './StylingModules/Feed.module.css';
import { splitProps, JSX } from 'solid-js';
import PostPreview from './PostPreview';
import { GetAllPosts, GetPinnedPosts } from '../api/posts';
import $ from "jquery"

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

  function PinnedPosts() {

  GetPinnedPosts().then((PinnedPosts) => {
    PinnedPosts.data.forEach(post => {
      $("#pinned-posts").append((<PostPreview data={post} />))
    });
  })


    return (
      <>
        <div id="pinned-posts"></div>
      </>
    )
  }

  function AllPosts() {

  GetAllPosts().then((AllPosts) => {
    AllPosts.data.forEach(post => {
      $("#all-posts").append((<PostPreview data={post} />))
    });
  })


    return (
      <>
        <div id="all-posts"></div>
      </>
    )
  }

  return(
    <>
      <FeedContainer>
        <PinnedPosts />
        <EditFeedResult />
        <AllPosts />
      </FeedContainer>
    </>
    )
}

// async function updatePosts() {
//   $("#pinned-posts").empty()
//   $("#all-posts").empty()
//   const PinnedPosts = await GetPinnedPosts()
//   PinnedPosts.data.forEach(post => {
//     $("#pinned-posts").append((<Post data={post} />))
//   });
//   const AllPosts = await GetAllPosts()
//   AllPosts.data.forEach(post => {
//     $("#all-posts").append((<Post data={post} />))
//   });
// }