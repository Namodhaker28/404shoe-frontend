import { useState } from "react";
import "../../styles/login.module.css";
import Link from "next/link";
import { addDataFromApi } from "@/utils/api";
import { toast } from "react-toastify";

function Login() {
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

const signup = async ()=>{
const body = {
    name:name,
    email : email,
    mobile:mobile,
    password:password
}
const res = await addDataFromApi("signup",body)
    console.log(res)
    notify()
}

const notify = () => {
  toast.success("Signup successfull", {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "dark",
  });
};

  return (
    <div className="container">
      <div className="container-login">
        <div className="wrap-login">
          <form className="login-form">
            <span className="login-form-title"> Welcome to Signup </span>

            <div className="wrap-input">
              <input
                className={name !== "" ? "has-val input" : "input"}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <span className="focus-input" data-placeholder="Name"></span>
            </div>

            <div className="wrap-input">
              <input
                className={email !== "" ? "has-val input" : "input"}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <span className="focus-input" data-placeholder="Email"></span>
            </div>

            <div className="wrap-input">
              <input
                className={mobile !== "" ? "has-val input" : "input"}
                type="number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
              />
              <span className="focus-input" data-placeholder="Mobile"></span>
            </div>

            <div className="wrap-input">
              <input
                className={password !== "" ? "has-val input" : "input"}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span className="focus-input" data-placeholder="Password"></span>
            </div>

            <div className="container-login-form-btn">
              <button onClick={signup} className="login-form-btn">Signup</button>
            </div>

            <div className="text-center">
              <span className="txt1"> Have an account? </span>
              <Link className="txt2" href="/auth/login">
        Login Here
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
