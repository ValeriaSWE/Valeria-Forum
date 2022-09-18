import Navbar from "../Components/Navbar";
import styles from './StylingModules/404.module.css';

export default function NotFound() {
  document.title = "Valeria Roleplay | 404";
  return (
  <>
   <Navbar />
   <div class={styles.pageNotFound}>
    <div class={styles.content}>
      <i class="material-icons">error</i>
      <h1>Sidan du söker verkar <br /> inte finnas.</h1>
      <a onClick={() => {history.back()}}>Tillbaka</a>
    </div>
   </div>
  </>)
}