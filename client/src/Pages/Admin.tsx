import AdminUserList from "../Components/Admin/UserList";
import Navbar from "../Components/Navbar";

export default function Admin() {
  document.title = "Valeria Roleplay | Admin";

  return (
  <>
    <Navbar />
    <h2>Admin</h2>

    <AdminUserList />
  </>)
}

// nicknames: [String],
// username: String,
// email: {type: String, required: true, lowercase: true},
// password: {type: String, required: true},
// joinedAt: {type: Date, default: () => Date.now(), immutible: true},
// role: {type: String, default: "none"},
// roleRank: {type: Number, default: 0},
// profilePicture: { data: Buffer, contentType: String }