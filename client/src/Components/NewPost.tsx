import $ from "jquery"
import { CreatePost } from "../api/posts"

import styles from './StylingModules/NewPost.module.css'

export default function NewPost() {

    // $('#create-post-btn').on('click', function() {
    //     console.log('test')
    //     console.log($('#create-post-img').val())
    // })

    $(function() {

        $('#create-post-img').on('change', function(e) {
            const images = Array.from($(this).prop('files'))
            
            for (const i in images) {
                // console.log(images[i])
                const size = parseFloat(((images[i].size/1024)/1024).toFixed(4)) // filesize in MB

                if (size > 5) {
                    $(this).val("")

                    alert('File ' + images[i].name + ' is to big!')
                    break
                }
            }

            // console.log("thsi")
            // console.log(images)
            // console.log(((images[0]?.size/1024)/1024).toFixed(4))
        })
    })

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
                        
                        formData.append('title', title)
                        formData.append('content', content)
                        
                        const post = await CreatePost(formData, JSON.parse(localStorage.getItem('profile'))?.token)
                        // console.log(post)

                        $('#create-post-title').val('')
                        $('#create-post-content').val('')
                        $('#create-post-img').val()
                    }
                }}>
                <h1 class={styles.infoHeader}>Skapa nytt inlägg!</h1>
                <p class={styles.infoText}>Forumet har stöd för: <a href="https://www.markdownguide.org/basic-syntax/">Markdown</a></p>
                
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
            // console.log(url.split('/')[2])
            return ( `[${url.split('/')[2]}](${url})` )
        }))
    // or alternatively
    // return text.replace(urlRegex, '<a href="$1">$1</a>')
}