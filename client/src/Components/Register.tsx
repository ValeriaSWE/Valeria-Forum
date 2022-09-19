import axios from "axios"
import $ from "jquery"
import { RegisterUserServerPost } from "../api/user.jsx"
import { Auth } from "../functions/user.js"

import styles from './StylingModules/Register.module.css'


/**
 * Creates the visual elements for a registration form
*/
export default function Register(props) {
    function cancel() {
        props.cancel()
        $('#register-email').val('')
        $('#register-username').val('')
        $('#register-password').val('')
        $('#register-password-confirm').val('')
    }

    return(
        <>
            <form onSubmit={e => e.preventDefault()}>
                <div class={styles.registerInnerContainer}>

                    <h2 class={styles.title}> REGISTRERA</h2>
                    {/* <form action=""> */}

                    <div class={styles.input}>
                        <p>Anändarnamn:</p>
                        <input type="text" name="username" id="register-username" />
                    </div>

                    <div class={styles.input}>
                        <p>Email:</p>
                        <input type="email" name="email" id="register-email" />
                    </div>

                    <div class={styles.input}>
                        <p>Lösenord:</p>
                        <input type="password" name="password" id="register-password"/>
                    </div>

                    <div class={styles.input}>
                        <p>Upprepa lösenord:</p>
                        <input type="password" name="password-confirm" id="register-password-confirm"/>
                    </div>

                    <div class={styles.forgotPassword}>
                        <p></p>
                    </div>

                    <button class={styles.registerBtn} id="register-submit" onClick={registerSubmit}>Registrera</button>
                    
                    <button class={styles.cancelBtn} id="register-cancel" onClick={cancel}>Avbryt</button>

                    {/* </form> */}

                    <span class={styles.registerError} id="error"></span>

                    <div class={styles.registerFooter}>
                        <p>Valeria Roleplay | Registrering</p>
                    </div>

                </div>
            </form>

        </>
    )
}

/**
 * RegisterPost is a function that takes four parameters, email, password, passwordConfirm, and
 * username, and returns the result of an axios post request to the url
 * 'http://localhost:8000/user/register' with the parameters email, password, passwordConfirm, and
 * username.
 * @param {String} email - String, password: String, passwordConfirm: String, username: String
 * @param {String} password - String
 * @param {String} passwordConfirm - String,
 * @param {String} username - String
 */

/**
 * registerSubmit takes the values of the username, password, and passwordConfirm fields, and then sends them to
 * the registerPost function. 
 * 
 * If the registerPost function returns a user, it logs the user to the console. 
 * 
 * If the registerPost function returns an error, it logs the error to the console.
 */
const registerSubmit = async () => {
    const email = $('#register-email').val()
    const username = $('#register-username').val()
    const password = $('#register-password').val()
    const passwordConfirm = $('#register-password-confirm').val()

    try {
        const {data} = await RegisterUserServerPost(email, password, passwordConfirm, username)
        Auth(data)
        window.location.reload();
    } catch (error) {
        $('#error').html(error.response.data.message)
        // console.log(error.response.data.message)
    }
}
