import styles from './StylingModules/Feed.module.css';
import { splitProps, JSX, createSignal, For, Show } from 'solid-js';
import PostPreview from './PostPreview';
import { GetAllPosts, GetPinnedPosts } from '../api/posts';
import $ from "jquery"

export default function Feed() {
  
  const [allPosts, setAllPosts] = createSignal([])
  const [pinnedPosts, setPinnedPosts] = createSignal([])

  const [sort, setSort] = createSignal('createdAt')

  // let prevSort = "createdAt"

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
            // let sort = "interactionCount"
            if (sort() == 'interactionCount') {
              setSort('interactionCount-inverse')
            } else {
              setSort('interactionCount')
            }
            // $('#current-sort-icon').remove()
            // if (prevSort == "interactionCount") {
            //   sort = "interactionCount-inverse"
            //   $('#sort-hot').append("<i class='material-icons' id='current-sort-icon'>keyboard_double_arrow_up</i>")
            // } else {
            //   $('#sort-hot').append("<i class='material-icons' id='current-sort-icon'>keyboard_double_arrow_down</i>")
            // }

            // prevSort = sort

            sortPosts(sort())
          }}>        
            <i class='material-icons'>whatshot</i>
            <p>Populärt</p>
            <Show when={sort() == 'interactionCount'}>
              <i class='material-icons' id='current-sort-icon'>keyboard_double_arrow_down</i>
            </Show>
            <Show when={sort() == 'interactionCount-inverse'}>
              <i class='material-icons' id='current-sort-icon'>keyboard_double_arrow_up</i>
            </Show>
          </button>
          <button id='sort-latest' class={styles.editFeedIconButton} onClick={() => {
            if (sort() == 'createdAt') {
              setSort('createdAt-inverse')
            } else {
              setSort('createdAt')
            }
            // $('#current-sort-icon').remove()
            // if (prevSort == "createdAt") {
            //   sort = "createdAt-inverse"
            //   $('#sort-latest').append("<i class='material-icons' id='current-sort-icon'>keyboard_double_arrow_up</i>")
            // } else {
            //   $('#sort-latest').append("<i class='material-icons' id='current-sort-icon'>keyboard_double_arrow_down</i>")
            // }

            // prevSort = sort

            sortPosts(sort())
          }}>        
            <i class='material-icons'>update</i>
            <p>Senaste</p>
            <Show when={sort() == 'createdAt'}>
              <i class='material-icons' id='current-sort-icon'>keyboard_double_arrow_down</i>
            </Show>
            <Show when={sort() == 'createdAt-inverse'}>
              <i class='material-icons' id='current-sort-icon'>keyboard_double_arrow_up</i>
            </Show>
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

    // GetPinnedPosts().then((PinnedPosts) => {

    //   $("#pinned-posts").empty()
    //   PinnedPosts.data.forEach(post => {
    //     $("#pinned-posts").append(<PostPreview data={post} />)
    //   });
    // })
    
    GetPinnedPosts().then((PinnedPosts) => {
      setPinnedPosts(PinnedPosts.data)
    })

    return (
      <>
        <div id="pinned-posts">
          <For each={pinnedPosts()}>{post =>
            <PostPreview data={post} />
          }</For>
        </div>
      </>
    )
  }

  function AllPosts() {

    // GetAllPosts('createdAt', 0).then((AllPosts) => {
    //   $("#all-posts").empty()
    //   AllPosts.data.forEach(post => {
    //     $("#all-posts").append((<PostPreview data={post} />))
    //   });
    // })
    sortPosts('createdAt')


    return (
      <>
        <div id="all-posts">
          <For each={allPosts()}>{post =>
            <PostPreview data={post} />
          }</For>
        </div>
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
      GetAllPosts(sort, 0).then((AllPosts) => {
        // console.log(AllPosts.data)
        setAllPosts(AllPosts.data)
        // console.log(allPosts)
        // $("#all-posts").empty()
        // AllPosts.data.forEach(post => {
        //   $("#all-posts").append((<PostPreview data={post} />))
        // });
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