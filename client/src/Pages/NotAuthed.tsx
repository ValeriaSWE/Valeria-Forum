import Navbar from "../Components/Navbar";
import styles from './StylingModules/NotAuthed.module.css';

export default function NotAuthed() {
  document.title = "Valeria Roleplay | tillstånd";
  return (
  <>
   <Navbar />
   <div class={styles.pageNotFound}>
    <div class={styles.content}>
      <i class="material-icons">report</i>
      <h1>Du har inte tillstånd<br />att se denna sida.</h1>
      <a onClick={() => history.back()}>Tillbaka</a>
    </div>
   </div>
  </>)
}