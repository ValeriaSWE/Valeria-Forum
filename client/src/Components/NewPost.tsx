import $ from "jquery"
import { useNavigate } from "solid-app-router"
import { createSignal, For, Show } from "solid-js"
import { createStore } from "solid-js/store";
import { CreatePost, GetAllowedTags } from "../api/posts"

import styles from './StylingModules/NewPost.module.css'

export default function NewPost() {
    const [tags, setTags] = createStore([])

    GetAllowedTags(JSON.parse(localStorage.getItem('profile'))?.token || "").then(res => {
        const {data} = res
        for (let i = 0; i < data.length; i++) {
            setTags([...tags, {...data[i], selected: false, id: i}])
        }
    })

    document.title  = "Valeria Roleplay | Nytt inlägg"

    const navigate = useNavigate()

    $(function() {

        $('#create-post-img').on('change', function(e) {
            const images = Array.from($(this).prop('files'))
            
            for (const i in images) {
                const size = parseFloat(((images[i].size/1024)/1024).toFixed(4)) // filesize in MB

                if (size > 5) {
                    $(this).val("")

                    alert('File ' + images[i].name + ' is to big!')
                    break
                }
            }

        })
    })

    function setTagActive(tagId: number, state: boolean) {
        setTags(tag => tag.id === tagId, 'selected', selected => state)
    }

    return (
        <div class={styles.newPostContainer}>
            <form class={styles.newPostForm} action="" id="create-post-form" onSubmit={async e => {
                    // * https://stackoverflow.com/questions/51586812/multer-react-nodejs-axios-request
                    e.preventDefault()
                    
                    const data = $('#create-post-form').serialize()
                    
                    const title = $('#create-post-title').val()?.toString()
                    const content = urlify($('#create-post-content').val()?.toString() || "")
                    const images = Array.from($('#create-post-img').prop('files'))
                    
                    if (title && content){
                    
                        let formData = new FormData()

                        images.forEach(image => {
                            formData.append('images', image)
                        })

                        tags.forEach(tag => {
                            if (tag.selected) {
                                formData.append('tags', tag._id)
                            }
                        })
                        
                        formData.append('title', title)
                        formData.append('content', content)
                        
                        const post = await CreatePost(formData, JSON.parse(localStorage.getItem('profile'))?.token)

                        navigate("/forum/post/" + post.data)

                        $('#create-post-title').val('')
                        $('#create-post-content').val('')
                        $('#create-post-img').val()
                    }
                }}>
                <h1 class={styles.infoHeader}>Skapa nytt inlägg!</h1>
                <p class={styles.infoText}>Forumet har stöd för: <a href="https://www.markdownguide.org/basic-syntax/">Markdown</a></p>
                
                <div class={styles.pickedTags}>
                    <p>Valda taggar:</p>
                    <For each={tags}>{(tag, i) =>
                        <Show when={tag.selected}>
                            <button onClick={() => setTagActive(tag.id, false)}>{tag.name} X</button>
                        </Show>
                    }</For>
                </div>
                <div class={styles.notPickedTags}>
                    <p>Välj taggar:</p>
                    <For each={tags}>{(tag) =>
                        <Show when={!tag.selected}>
                            <button onClick={() => setTagActive(tag.id, true)}>{tag.name}</button>
                        </Show>
                    }</For>
                </div>

                <input type="text" placeholder="Titel" id="create-post-title" name="title" class={styles.title}/>
                <div class={styles.growWrap} >
                    <textarea class={styles.contentEditing} id="create-post-content" onInput="this.parentNode.dataset.replicatedValue = this.value"></textarea>
                </div>
                {/* <textarea name="content" id="create-post-content" cols="30" rows="10"></textarea> */}
                <input type="file" name="image" id="create-post-img" multiple accept="image/png, image/jpeg"/>
                <button type="submit" id="create-post-btn">Skapa</button>
            </form>
        </div>
    )
}

// https://stackoverflow.com/questions/1500260/detect-urls-in-text-with-javascript
// https://regexr.com/
function urlify(text: string) {
    var urlRegex = /(?<!\]\()(http:\/\/|https:\/\/)[a-zA-Z0-9._+-]+\.[a-z]+[a-zA-Z0-9\/._+-]+/g;
    return (text.replace(urlRegex, function(url: string) {
            return ( `[${url.split('/')[2]}](${url})` )
        }))
}