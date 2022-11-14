import axios from "axios";
import { URL } from "./common";

export const GetValeriaData = () => axios.get(`${URL}/api/getValeriaData/`)
