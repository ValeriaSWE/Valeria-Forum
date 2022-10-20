import styles from './StylingModules/Feed.module.css';
import { splitProps, JSX, createSignal, For, Show } from 'solid-js';
import PostPreview from './PostPreview';
import { GetAllPosts, GetPinnedPosts } from '../api/posts';
import $ from "jquery"
import { useLocation } from 'solid-app-router';

export default function Feed() {
  
  const [allPosts, setAllPosts] = createSignal([])
  const [pinnedPosts, setPinnedPosts] = createSignal([])
  const search = useLocation().search
  const searchParams = new URLSearchParams(search)

  const [sort, setSort] = createSignal(searchParams.get('sort') || 'createdAt')
  const [page, setPage] = createSignal(parseInt(searchParams.get('page')|| "1"))
  const [pages, setPages] = createSignal(1)
  const [limit, setLimit] = createSignal(parseInt(searchParams.get('limit')|| "10"))

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
      <div>
      </div>
    </div>
    </>)
  }

  function PinnedPosts() {
    
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

    sortPosts()


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

  return(
    <>
      <FeedContainer>
        <PinnedPosts />
        <EditFeedResult />
        <AllPosts />
        <PageSelect />
      </FeedContainer>
    </>
    )
    
    function sortPosts() {
      GetAllPosts(sort(), page() - 1, limit()).then((AllPosts) => {
        setAllPosts(AllPosts.data.posts)
        setPages(AllPosts.data.pages)
        searchParams.set('sort', sort())
        searchParams.set('page', page().toString())
        searchParams.set('limit', limit().toString())
      })
    }
}