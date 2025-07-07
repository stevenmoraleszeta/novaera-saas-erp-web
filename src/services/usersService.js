import axios from "../lib/axios";

export async function getUsers() {
  const { data } = await axios.get("/users");
  return data;
}
