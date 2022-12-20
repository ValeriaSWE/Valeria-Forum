import TextField from "@suid/material/TextField";
import $ from "jquery"
import { RegisterUserServerPost } from "../api/user.js"
import { Auth } from "../functions/user.js"
import { createSignal } from "solid-js"

import styles from './StylingModules/Register.module.css'


/**
 * Creates the visual elements for a registration form
*/
export default function Register(props) {
    const body = document.querySelector("body");
    body.style.overflow = "hidden";
    function cancel() {
        props.cancel()
        body.style.overflow = "auto";
        $('#register-email').val('')
        $('#register-username').val('')
        $('#register-password').val('')
        $('#register-password-confirm').val('')
    }

    const [userError, setUserError] = createSignal(false)
    const [emailError, setEmailError] = createSignal(false)
    const [passError, setPassError] = createSignal(false)
    const [passConfError, setPassConfError] = createSignal(false)
    
    return(
        <>
            <form onSubmit={e => e.preventDefault()}>
                <div class={styles.registerInnerContainer}>

                    <h2 class={styles.title}> REGISTRERA</h2>
                    {/* <form action=""> */}

                    {/* <div class={styles.input}>
                        <p>Anändarnamn:</p>
                        <input title="Must be atleast 4 characters." type="text" name="username" id="register-username" pattern="[a-zA-Z0-9._-]{4,}" required />
                        <p class={styles.sublabel}>Minst fyra tecken. Inga specialtecken.</p>
                    </div> */}
                    <TextField id="register-username" label="Användarnamn" variant="standard" required classes={{root: styles.input}} error={userError()} helperText={userError() ? "Minst fyra tecken." : ""} onChange={(e) => {
                        const regex = /[a-zA-Z0-9._-]{4,}/g

                        if (!e.target.value.match(regex) && !userError()) {
                            setUserError(true)
                        } else if (e.target.value.match(regex) && userError()) {
                            setUserError(false)
                        }
                        
                    }} />


                    {/* <div class={styles.input}>
                        <p>Email:</p>
                        <input type="email" name="email" id="register-email" pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$" required/>
                    </div> */}
                    <TextField id="register-email" label="Epost" variant="standard" required classes={{root: styles.input}} type="email" error={emailError()} helperText={emailError() ? "Ange en giltlig epost." : ""} onChange={(e) => {
                        const regex = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/g

                        if (!e.target.value.match(regex) && !emailError()) {
                            setEmailError(true)
                        } else if (e.target.value.match(regex) && emailError()) {
                            setEmailError(false)
                        }
                        
                    }} />


                    {/* <div class={styles.input}>
                        <p>Lösenord:</p>
                        <input title="Must be atleast 8 characters of: a-z, 0-9 and !@#$%^&*+_£-" type="password" name="password" id="register-password" pattern="[a-zA-Z0-9!@#$%^&*+_£-]{8,}" required/>
                        <p class={styles.sublabel}>Minst åtta tecken.</p>
                    </div> */}
                    <TextField id="register-password" label="Lösenord" variant="standard" required classes={{root: styles.input}} type="password" error={passError()} helperText={passError() ? "Minst åtta tecken." : ""} onChange={(e) => {
                        const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/g // /[a-zA-Z0-9!@#$%^&*+_£-]{8,}/g

                        if (!e.target.value.match(regex) && !passError()) {
                            setPassError(true)
                        } else if (e.target.value.match(regex) && passError()) {
                            setPassError(false)
                        }
                        
                    }} />

                    {/* <div class={styles.input}>
                        <p>Upprepa lösenord:</p>
                        <input type="password" name="password-confirm" required id="register-password-confirm" onKeyUp={() => {
                            if ($('#register-password').val() == $('#register-password-confirm').val()) {
                                $('#register-password-confirm').removeClass(styles.incorrect)
                            } else {
                                $('#register-password-confirm').addClass(styles.incorrect)
                            }
                        }}/>
                    </div> */}
                    <TextField id="register-password-confirm" label="Upprepa Lösenord" variant="standard" required classes={{root: styles.input}} type="password" error={passConfError()} helperText={passConfError() ? "Matchar inte." : ""} onChange={(e) => {
                        if (e.target.value != $('#register-password').val() && !passConfError()) {
                            setPassConfError(true)
                        } else if (e.target.value == $('#register-password').val() && passConfError()) {
                            setPassConfError(false)
                        }
                        
                    }} />


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
    }
}
