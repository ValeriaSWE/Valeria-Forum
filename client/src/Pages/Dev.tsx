import { NavLink, Outlet, Route, RouteDefinition, Routes } from "solid-app-router";
import { mergeProps, Suspense } from "solid-js";
import Navbar from "../Components/Navbar";
import axios from "axios"

import Login from "../Components/Login"
import Register from "../Components/Register";

export default function Dev() {
  document.title = "Valeria Roleplay | Dev";

  const admin = false;
  return (
  <>
    <Navbar />
    <h2>DEV</h2>
    {/* <Login/> */}
    {/* <Register/> */}
  </>)
}