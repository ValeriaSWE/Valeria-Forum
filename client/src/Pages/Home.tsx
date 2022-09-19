import { mergeProps, Show } from "solid-js";
import {Router,Routes, Route, Link, useRoutes, Outlet, RouteDefinition} from "solid-app-router";

import styles from './StylingModules/Home.module.css'
import { style } from "solid-js/web";

export default function Home() {
  document.title = "Valeria Roleplay";
  const isAdmin = false;
  return (
  <>
    <div class={styles.home}>
        <div class={styles.container}>

          <img class={styles.logo} src="https://cdn.discordapp.com/attachments/1015552695207202908/1018837703531446333/Valeria-Alt2.png" alt="Bild" />

          <h1 class={styles.title}>VALERIA ROLEPLAY</h1>

          <div class={styles.buttons}>
            <a class={styles.btn} href='https://discord.gg/nveyQhUBQr' target="_blank" >Discord</a>
            <a class={styles.btn} href='/forum' >Forum</a>
            <a class={styles.btn} >FiveM</a>

            <Show when={isAdmin}>
                <a>Admin</a>
              </Show>
          </div>
        </div>
    </div>
  </>)
}