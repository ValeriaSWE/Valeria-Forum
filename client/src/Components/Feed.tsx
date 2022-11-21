import styles from './StylingModules/Feed.module.css';
import { createSignal, For, Show } from 'solid-js';
import { createStore } from 'solid-js/store'
import PostPreview from './PostPreview';
import { GetAllPosts, GetAllTags, GetPinnedPosts } from '../api/posts';
// import $ from "jquery"
import { useLocation } from 'solid-app-router';
import Skeleton from "@suid/material/Skeleton"

function Loader() {
  // const isRouting = useIsRouting();
  return (
    <div class={styles.loader}>
      <Skeleton height="2.5rem" variant='circular' style="aspect-ratio: 1/1;" />
      <Skeleton variant='text' width="7.25rem" style="font-size: 2rem;"/>
      <div class={styles.loaderPostContent}>
        <Skeleton variant='text' style="font-size: 1.5rem;"/>
        <Skeleton variant='text' style="font-size: 1rem;"/>
      </div>
      <Skeleton variant='text' style="font-size: 1.5rem;" width="8rem"/>
      <Skeleton variant='rectangular' width="3.25rem" height="2rem" style="border-radius: var(--border-radius)"/>
      <Skeleton variant='rectangular' width="3.25rem" height="2rem" style="border-radius: var(--border-radius)"/>
    </div>
  )
  // return <div data-component="loader" class="loader active" />;
}

export default function Feed() {
  
  
  const [allPosts, setAllPosts] = createSignal([])
  const [allPostsLoaded, setAllPostsLoaded] = createSignal(false)
  const [pinnedPosts, setPinnedPosts] = createSignal([])
  const search = useLocation().search
  const searchParams = new URLSearchParams(search)

  // const [sortParams, setSortParams] = createStore({sort: (searchParams.get('sort') || 'createdAt'), page: parseInt(searchParams.get('page')|| "1"), limit: parseInt(searchParams.get('limit')|| "10")})
  
  const [sort, setSort] = createSignal(searchParams.get('sort') || 'createdAt')
  const [page, setPage] = createSignal(parseInt(searchParams.get('page')|| "1"))
  const [pages, setPages] = createSignal(1)
  const [limit, setLimit] = createSignal(parseInt(searchParams.get('limit')|| "10"))
  
  const [tags, setTags] = createStore([])

  GetAllTags(JSON.parse(localStorage.getItem('profile'))?.token || "").then(res => {
    const {data} = res
    for (let i = 0; i < data.length; i++) {
        setTags([...tags, {...data[i], selected: false, id: i}])
    }
    console.table(tags)
  })
  // const [posts] = createResource(sortParams, GetAllPosts)

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
          <button id='sort-hot' class={styles.editFeedIconButton} onClick={() => {
            if (sort() == 'interactionCount') {
              setSort('interactionCount-inverse')
            } else {
              setSort('interactionCount')
            }

            sortPosts()
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

            sortPosts()
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
          <Show when={page() > 1} fallback={
            <button class={styles.editFeedIconButton} style="background-color: var(--color-white-m); cursor: unset;"><i class='material-icons'>navigate_before</i></button>
          }>
            <button class={styles.editFeedIconButton} onClick={() => {setPage(page() - 1); sortPosts();}}><i class='material-icons'>navigate_before</i></button>
          </Show>
          <button class={styles.editFeedIconButton} style="cursor: unset;">Sida: {page()}</button>
          <Show when={page() < pages()} fallback={
            <button class={styles.editFeedIconButton} style="background-color: var(--color-white-m); cursor: unset;"><i class='material-icons'>navigate_next</i></button>
          }>
            <button class={styles.editFeedIconButton} onClick={() => {setPage(page() + 1); sortPosts();}}><i class='material-icons'>navigate_next</i></button>
          </Show>
        </div>
        <div>
        </div>
        <div class={styles.searchFeed}>        
            <i class='material-icons'>search</i>
            <input type="text" placeholder='Sök efter Feed' />
        </div>
        <a class={styles.editFeedIconButton} href="/forum/newpost"/*onclick={() => location.href="/forum/newpost"}*/>
          <i class='material-icons'>add</i>
          Skapa inlägg
        </a>
      <div>
      </div>
    </div>
    </>)
  }

  function PinnedPosts() {
    
    GetPinnedPosts().then((PinnedPosts) => {
      setPinnedPosts(PinnedPosts.data.posts)
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

    sortPosts()


    return (
      <>
        <div class={styles.posts} id="all-posts">
          <Show when={allPostsLoaded()} fallback={Loader}>
            <For each={allPosts()}>{post =>
              <PostPreview data={post} />
            }</For>
          </Show>
        </div>
      </>
    )
  }

  function PageButton(props: {
    v: number
  }) {

    const v = props.v

    return (
      <Show when={v + 1 == page()} fallback={
        <button class={styles.editFeedIconButton} onClick={() => {setPage(v + 1); sortPosts();}}>{v + 1}</button>
      }>
        <button class={styles.editFeedIconButton} style="cursor: unset; background-color: var(--color-white-m);">{v + 1}</button>
      </Show>
    )
  }

  function PageSelect() {
    return (
      <>
        <div class={styles.pageControls} style="justify-content: center;">
          <Show when={page() > 1} fallback={
            <button class={styles.editFeedIconButton} style="background-color: var(--color-white-m); cursor: unset;"><i class='material-icons'>navigate_before</i></button>
          }>
              <button class={styles.editFeedIconButton} onClick={() => {setPage(page() - 1); sortPosts();}}><i class='material-icons'>navigate_before</i></button>
          </Show>
          <Show when={pages() < 15} fallback={
            <>
              {/* Make style work when there is alot of pages */}
              <Show when={page() <= 3}>
                <For each={[... Array(3).keys()]}>{(v, i) =>
                  <PageButton v={v} />
                }</For>
                <p>...</p>
                <For each={[pages() - 1]}>{(v, i) =>
                  <PageButton v={v} />
                }</For>
              </Show>
              <Show when={page() >= pages() - 3}>
                <For each={[0]}>{(v, i) =>
                  <PageButton v={v} />
                }</For>
                <p>...</p>
                <For each={[pages() - 3, pages() - 2, pages() - 1]}>{(v, i) =>
                  <PageButton v={v} />
                }</For>
              </Show>
              <Show when={page() < pages() - 3 && page() > 3}>
                <For each={[0]}>{(v, i) =>
                  <PageButton v={v} />
                }</For>
                <p>...</p>
                <For each={[page() - 2, page() - 1, page()]}>{(v, i) =>
                  <PageButton v={v} />
                }</For>
                <p>...</p>
                <For each={[pages() - 1]}>{(v, i) =>
                  <PageButton v={v} />
                }</For>
              </Show>
            </>
          }>
            <For each={[... Array(pages()).keys()]}>{(v, i) =>
              <PageButton v={v} />
            }</For>
          </Show>
          <Show when={page() < pages()} fallback={
              <button class={styles.editFeedIconButton} style="background-color: var(--color-white-m); cursor: unset;"><i class='material-icons'>navigate_next</i></button>
          }>
              <button class={styles.editFeedIconButton} onClick={() => {setPage(page() + 1); sortPosts();}}><i class='material-icons'>navigate_next</i></button>
          </Show>
        </div>
      </>
    )
  }

  function TagFilters() {

    function setTagActive(tagId: number, state: boolean) {
      setTags(tag => tag.id === tagId, 'selected', selected => state)
      sortPosts()
    }

    return (
      <div class={styles.pageControls}>
        <div class={styles.selectedTags}>
          <For each={tags}>{ tag =>
            <Show when={tag.selected}>
              <button onClick={() => setTagActive(tag.id, false)}>{ tag.name } X</button>
            </Show>
          }</For>
        </div>
        <div class={styles.notSelectedTags}>
          <For each={tags}>{ tag =>
            <Show when={!tag.selected}>
              <button onClick={() => setTagActive(tag.id, true)}>{ tag.name }</button>
            </Show>
          }</For>
        </div>
      </div>
    )
  }

  return(
    <>
      <Show when={allPosts()}>
        <FeedContainer>
          <PinnedPosts />
          <EditFeedResult />
          <TagFilters />
          <AllPosts />
          <PageSelect />
        </FeedContainer>
      </Show>
    </>
    )
    
  function sortPosts() {
    let tagList: string[] = []

    tags.forEach(tag => {
      if (tag.selected) {
        tagList = [...tagList, tag._id]
      }
    })

    setAllPostsLoaded(false)
    GetAllPosts(sort(), page() - 1, limit(), tagList).then((AllPosts) => {
      setAllPosts(AllPosts.data.posts)
      setPages(AllPosts.data.pages)
      searchParams.set('sort', sort())
      searchParams.set('page', page().toString())
      searchParams.set('limit', limit().toString())
      setAllPostsLoaded(true)
    })
  }
}