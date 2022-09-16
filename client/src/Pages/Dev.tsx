import { NavLink, Outlet, Route, RouteDefinition, Routes } from "solid-app-router";
import { mergeProps, Suspense } from "solid-js";
import Navbar from "../Components/Navbar";


async function getUser() {
    const response = await fetch('http://localhost:8000/getUser', 
        {
            method: "GET",
            mode: "no-cors",
            // body: JSON.stringify({
            //     hello: "world"
            // })
            headers: {
                'Content-Type': "application/json",
                'hello': "world"
            }
        }
    
    );

    console.log(response.json());
    // console.log(response);
}

export default function Dev() {
  document.title = "Valeria Roleplay | Dev";

  const admin = false;
  return (
  <>
   <h2>DEV</h2>
   <button onClick={getUser}>Get User</button>
  </>)
}