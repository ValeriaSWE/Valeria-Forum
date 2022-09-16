import axios from "axios"
import $ from "jquery"
import { Auth } from "../functions/user.js"
export default function Login() {
    return(
        <>
            <h2>Login</h2>
            {/* <form action=""> */}
                <input type="email" name="email" id="login-email" />
                <input type="password" name="password" id="login-password"/>
                <button id="login-submit" onClick={loginSubmit}>Login</button>
            {/* </form> */}
            <span id="error">No Error</span>

        </>
    )
}

const loginPost = (username: String, password: String) => axios.post(`http://localhost:8000/user/login`, {username, password})

const loginSubmit = async () => {
    const username = $('#login-email').val()
    const password = $('#login-password').val()
    
    try {
        const { data } = await loginPost(username, password)
        Auth(data)

    } catch (error) {
        $('#error').html(error.response.data.message)
        // console.log(error.response.data.message)
    }
    
}

const auth = async (data) => {
    localStorage.setItem('profile', JSON.stringify({ ... data }))
}
