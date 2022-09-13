import { NavLink } from "solid-app-router";
import { $DEVCOMP, mergeProps } from "solid-js";


export default function Navbar() {
  document.title = "Valeria Roleplay | Forum";
  /*
 
  */
 const searchBarFocus = () => {
  const searchinput = document.getElementById('search_field') as HTMLDivElement | null;
  const searchclose = document.querySelector<HTMLElement>('#search__close')!;
  searchinput?.focus()
 }

  return (
  <>
   <nav data-component="navbar">
    <div class="navbar__inner">
      <div class="logo">
        <h1>Forum</h1>
      </div>
      <div class="navbar__buttons">
      <NavLink href="a">Feed</NavLink>
      <NavLink href="b">Ansökningar</NavLink>
      </div>
      <div>
        <button>Registrera</button>
        <button>Logga in</button>
      </div>
    </div>
   </nav>
  </>)
}