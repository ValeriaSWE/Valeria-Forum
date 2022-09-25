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
            <form action="" id="create-post-form" enctype="multipart/form-data" onSubmit={e => {
                    e.preventDefault()

                    const data = $('#create-post-form').serialize()

                    console.log(data)
                    const title = $('#create-post-title').val()
                    const content = $('#create-post-content').val()
                    // const img = $('#create-post-img').prop('files')[0]

                    // console.log(img)

                    // * Read file on client:
                    // * https://stackoverflow.com/questions/750032/reading-file-contents-on-the-client-side-in-javascript-in-various-browsers

                    // const reader = new FileReader()
                    // reader.readAsArrayBuffer(img)
                    // reader.onload = function (evt) {
                    //     console.log(new Uint8Array(evt.target?.result))
                        
                    CreatePost(title, content, [], JSON.parse(localStorage.getItem('profile'))?.token)
                    // }
                    // reader.onerror = function (evt) {
                    //     console.error('Error loading file')
                    // }

                }}>
                
                <input type="text" placeholder="Titel" id="create-post-title"/>
                <textarea name="" id="create-post-content" cols="30" rows="10"></textarea>
                {/* <input type="file" name="" id="create-post-img" /> */}
                <button type="submit" id="create-post-btn">Skapa</button>
            </form>
        </>
    )
}