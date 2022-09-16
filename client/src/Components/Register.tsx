import axios from "axios"
import $ from "jquery"
import { Auth } from "../functions/user.js"

export default function Register() {
    return(
        <>
            <h2>Register</h2>
            {/* <form action=""> */}
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
 * RegisterPost is a function that takes three parameters, username, password, and passwordConfirm, and
 * returns the result of an axios post request to the url 'http://localhost:8000/user/register' with
 * the parameters username, password, and passwordConfirm.
 * @param {String} username - String
 * @param {String} password - String
 * @param {String} passwordConfirm - String
 */
const registerPost = (username: String, password: String, passwordConfirm: String) => axios.post('http://localhost:8000/user/register', {username, password, passwordConfirm})

/**
 * registerSubmit takes the values of the username, password, and passwordConfirm fields, and then sends them to
 * the registerPost function. 
 * 
 * If the registerPost function returns a user, it logs the user to the console. 
 * 
 * If the registerPost function returns an error, it logs the error to the console.
 */
const registerSubmit = async () => {
    const username = $('#register-email').val()
    const password = $('#register-password').val()
    const passwordConfirm = $('#register-password').val()

    try {
        const {data} = await registerPost(username, password, passwordConfirm)
        Auth(data)
    } catch (error) {
        $('#error').html(error.response.data.message)
        // console.log(error.response.data.message)
    }

}
