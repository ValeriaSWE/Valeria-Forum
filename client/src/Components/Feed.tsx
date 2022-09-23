import styles from './StylingModules/Feed.module.css';
import { splitProps, JSX } from 'solid-js';
import PostPreview from './PostPreview';
import { GetAllPosts, GetPinnedPosts } from '../api/posts';
import $ from "jquery"

export default function Feed() {
  
  let prevSort = "createdAt"

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
          {/* <div class={styles.editFeedIconButton}>
            <i class='material-icons'>group</i>
            <p>Följer</p>
          </div> */}
          <button id='sort-hot' class={styles.editFeedIconButton} onClick={() => {
            let sort = "hot"
            $('#current-sort-icon').remove()
            if (prevSort == "hot") {
              sort = "hot-inverse"
              $('#sort-hot').append("<i class='material-icons' id='current-sort-icon'>keyboard_double_arrow_up</i>")
            } else {
              $('#sort-hot').append("<i class='material-icons' id='current-sort-icon'>keyboard_double_arrow_down</i>")
            }

            prevSort = sort

            sortPosts(sort)
          }}>        
            <i class='material-icons'>whatshot</i>
            <p>Populärt</p>
          </button>
          <button id='sort-latest' class={styles.editFeedIconButton} onClick={() => {
            let sort = "createdAt"
            $('#current-sort-icon').remove()
            if (prevSort == "createdAt") {
              sort = "createdAt-inverse"
              $('#sort-latest').append("<i class='material-icons' id='current-sort-icon'>keyboard_double_arrow_up</i>")
            } else {
              $('#sort-latest').append("<i class='material-icons' id='current-sort-icon'>keyboard_double_arrow_down</i>")
            }

            prevSort = sort

            sortPosts(sort)
          }}>        
            <i class='material-icons'>sync</i>
            <p>Senaste</p>
            <i class='material-icons' id='current-sort-icon'>keyboard_double_arrow_down</i>
          </button>
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
      $("#pinned-posts").empty()
      PinnedPosts.data.forEach(post => {
        $("#pinned-posts").append(<PostPreview data={post} />)
      });
    })


    return (
      <>
        <div id="pinned-posts"></div>
      </>
    )
  }

  function AllPosts() {

    GetAllPosts('createdAt').then((AllPosts) => {
      $("#all-posts").empty()
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
    
    function sortPosts(sort: string) {
      GetAllPosts(sort).then((AllPosts) => {
        $("#all-posts").empty()
        AllPosts.data.forEach(post => {
          $("#all-posts").append((<PostPreview data={post} />))
        });
      })
    }
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