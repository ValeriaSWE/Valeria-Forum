import { NavLink, Outlet, Route, RouteDefinition, Routes } from "solid-app-router";
import { mergeProps, Suspense } from "solid-js";
import styles from './StylingModules/Forum.module.css';
import Navbar from "../Components/Navbar";



export default function Forum() {
  document.title = "Valeria Roleplay | Forum";

  return (
  <>
  <Navbar />
   <div class={styles.forum}>
    <div class={styles.tabContent}>
        <Suspense
          fallback={
            <p>Laddar innehåll</p>
          }
        >
          <Outlet />
        </Suspense>
      </div>
   </div>
  </>)
}