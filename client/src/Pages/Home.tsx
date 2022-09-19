import { mergeProps, Show } from "solid-js";
import {Router,Routes, Route, Link, useRoutes, Outlet, RouteDefinition} from "solid-app-router";

import styles from './StylingModules/Home.module.css'
import { style } from "solid-js/web";

export default function Home() {
  document.title = "Valeria Roleplay";
  const isAdmin = true;
  return (
  <>
    <div class={styles.home}>
        <div class={styles.container}>

          <img class={styles.logo} src="../images/valeria.png" alt="Bild" />

          <h1 class={styles.title}>VALERIA ROLEPLAY</h1>

          <div class={styles.buttons}>
            <a class={styles.btn} href='https://discord.gg/nveyQhUBQr' target="_blank" >Discord</a>
            <a class={styles.btn} href='/forum' >Forum</a>
            <a class={styles.btn} >FiveM</a>

          </div>
        </div>
    </div>
  </>)
}