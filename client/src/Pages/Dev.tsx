import Navbar from "../Components/Navbar";
import $ from "jquery"
import NewPost from "../Components/NewPost";
import styles from "./StylingModules/Dev.module.css"
import ValeriaServerInfo from "../Components/ValeriaServerInfo";

export default function Dev() {
  document.title = "Valeria Roleplay | Dev";

  const admin = false;
  return (
  <>
    <div class={styles.dev} style="margin-top: 5rem;">
      <Navbar />
      <h2>DEV</h2>
      {/* <NewPost /> */}
      <ValeriaServerInfo />
    </div>
  </>)
}
