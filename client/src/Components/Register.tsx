import axios from "axios"
import $ from "jquery"
import { Auth } from "../functions/user.js"

/**
 * Creates the visual elements for a registration form
*/
export default function Register() {
    return(
        <>
            <h2>Register</h2>
            {/* <form action=""> */}
                <input type="text" name="username" id="register-username" />
                <input type="email" name="email" id="register-email" />
                <input type="password" name="password" id="register-password"/>
                <input type="password" name="password-confirm" id="register-password-confirm"/>
                <button id="register-submit" onClick={registerSubmit}>Register</button>
            {/* </form> */}
            <span id="error">No Error</span>
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
const registerUserServerPost = (email: String, password: String, passwordConfirm: String, username: String) => axios.post('http://localhost:8000/user/register', {email, password, passwordConfirm, username})

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
    const passwordConfirm = $('#register-password').val()

    try {
        const {data} = await registerUserServerPost(email, password, passwordConfirm, username)
        Auth(data)
    } catch (error) {
        $('#error').html(error.response.data.message)
        // console.log(error.response.data.message)
    }

}
