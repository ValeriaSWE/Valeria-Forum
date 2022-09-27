import $ from "jquery"
import { CreatePost } from "../api/posts"
import fs from "fs"


export default function NewPost() {

    $('#create-post-btn').on('click', function() {
        console.log('test')
        console.log($('#create-post-img').val())
    })

    return (
        <>
            <form action="" id="create-post-form" onSubmit={async e => {
                    // * https://stackoverflow.com/questions/51586812/multer-react-nodejs-axios-request
                    e.preventDefault()
                    
                    const data = $('#create-post-form').serialize()
                    
                    const title = $('#create-post-title').val()
                    const content = $('#create-post-content').val()
                    const images = Array.from($('#create-post-img').prop('files'))
                    
                    
                    let formData = new FormData()

                    images.forEach(image => {
                        formData.append('images', image)
                    })
                    
                    formData.append('title', title)
                    formData.append('content', content)
                    
                    console.log(await CreatePost(formData, JSON.parse(localStorage.getItem('profile'))?.token))
                }}>
                
                <input type="text" placeholder="Titel" id="create-post-title" name="title"/>
                <textarea name="content" id="create-post-content" cols="30" rows="10"></textarea>
                <input type="file" name="image" id="create-post-img" multiple accept="image/png, image/jpeg"/>
                <button type="submit" id="create-post-btn">Skapa</button>
            </form>
        </>
    )
}
