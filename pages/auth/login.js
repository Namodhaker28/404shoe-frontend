import { useContext, useState } from "react";
import "../../styles/login.module.css";
import Link from "next/link";
import { toast } from "react-toastify";
import { addDataFromApi } from "@/utils/api";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import UserContext from "@/context/context";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const contextData = useContext(UserContext);
  const router = useRouter();
  const signin = async (e) => {
    e.preventDefault();
    const body = {
      email: email,
      password: password,
    };
    const res = await addDataFromApi("signin", body);
    console.log(res);
    if (res?.accessToken) {
      contextData.setUser(res?.user);
      Cookies.set("404Token", res.accessToken);
      router.push("/");
    }
  };

  return (
    <div className="container">
      <div className="container-login">
        <div className="wrap-login">
          <form className="login-form">
            <span className="login-form-title"> Welcome </span>

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
                className={password !== "" ? "has-val input" : "input"}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span className="focus-input" data-placeholder="Password"></span>
            </div>

            <div className="container-login-form-btn">
              <button onClick={signin} className="login-form-btn">
                Login
              </button>
            </div>

            <div className="text-center">
              {/* <span className="txt1">Don't have an account? </span> */}
              <Link className="txt2" href="/auth/signup">
                Create an account
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
