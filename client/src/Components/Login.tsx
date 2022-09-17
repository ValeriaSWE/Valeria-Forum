import axios from "axios"
import $ from "jquery"
import { Auth } from "../functions/user.js"

import styles from './StylingModules/Login.module.css'

/**
 * Creates the visual elements for a login form
*/
export default function Login() {
    return(
        <>
            <div class={styles.loginInnerContainer}>

                <h2 class={styles.title}> LOGGA IN</h2>
                {/* <form action=""> */}

                <div class={styles.input}>
                    <p>Anändarnamn / Email:</p>
                    <input type="email" name="email" id="login-email" />
                </div>

                <div class={styles.input}>
                    <p>Lösenord:</p>
                    <input type="password" name="password" id="login-password"/>
                </div>

                <div class={styles.forgotPassword}>
                    <p></p>
                </div>

                
                <button class={styles.loginBtn} id="login-submit" onClick={loginSubmit}>Logga in</button>
                

                
                {/* </form> */}
                
                <span class={styles.loginError} id="error"></span>

                <div class={styles.loginFooter}>
                    <p>Valeria Roleplay | Inloggning</p>
                </div>

            </div>

        </>
    )
}

/**
 * This function takes a username and password as arguments, and returns a promise that resolves to the
 * response from the server when the server is sent a POST request with the username and password as
 * the body.
 * @param {String} username - String
 * @param {String} password - String
 */
const loginUserServerPost = (username: String, password: String) => axios.post(`http://localhost:8000/user/login`, {username, password})

/**
 * It takes the username and password from the form, sends it to the server, and if the server responds
 * with a token, it saves the token in local storage.
 */
const loginSubmit = async () => {
    const username = $('#login-email').val()
    const password = $('#login-password').val()
    
    try {
        const { data } = await loginUserServerPost(username, password)
        Auth(data)

    } catch (error) {
        $('#error').html(error.response.data.message)
        // console.log(error.response.data.message)
    }
    
}

const auth = async (data) => {
    localStorage.setItem('profile', JSON.stringify({ ... data }))
}
