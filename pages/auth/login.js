import { useContext, useState } from "react";
import "../../styles/login.module.css";
import Link from "next/link";
import { toast } from "react-toastify";
import { addDataFromApi } from "@/utils/api";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import UserContext from "@/context/context";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

/**
 * Login page component
 * Handles user authentication with email and password
 */
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const contextData = useContext(UserContext);
  const router = useRouter();

  /**
   * Validate form inputs
   * @returns {boolean} - True if valid, false otherwise
   */
  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!email || email.trim() === "") {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!password || password.trim() === "") {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle login form submission
   * @param {Event} e - Form submit event
   */
  const signin = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      const firstError = Object.values(errors)[0];
      toast.error(firstError, {
        position: "top-right",
        autoClose: 3000,
        theme: "dark",
      });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const body = {
        email: email.trim(),
        password: password,
      };

      const res = await addDataFromApi("signin", body);

      if (res?.accessToken) {
        // Success - save token and user data
        Cookies.set("404Token", res.accessToken);
        contextData.setUser(res?.user);

        // Refresh user data to get latest cart/wishlist info
        if (contextData.refreshUser) {
          await contextData.refreshUser();
        }

        toast.success("Login successful! Redirecting...", {
          position: "top-right",
          autoClose: 2000,
          theme: "dark",
        });

        // Redirect after short delay for better UX
        setTimeout(() => {
          router.push("/");
        }, 500);
      } else {
        // Handle error response
        const errorMessage = res?.message || "Invalid email or password. Please try again.";
        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 4000,
          theme: "dark",
        });

        // Set specific field errors if provided
        if (res?.errors) {
          setErrors(res.errors);
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An unexpected error occurred. Please try again.", {
        position: "top-right",
        autoClose: 4000,
        theme: "dark",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        .error-message {
          color: #ff4444;
          font-size: 12px;
          margin-top: 5px;
          display: block;
        }
      `}</style>
      <div className="container">
        <div className="container-login">
          <div className="wrap-login">
            <form className="login-form" onSubmit={signin}>
              <span className="login-form-title"> Welcome </span>

            <div className="wrap-input">
              <input
                className={email !== "" ? "has-val input" : "input"}
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  // Clear error when user starts typing
                  if (errors.email) {
                    setErrors({ ...errors, email: "" });
                  }
                }}
                disabled={loading}
                autoComplete="email"
                required
              />
              <span className="focus-input" data-placeholder="Email"></span>
              {errors.email && (
                <span className="error-message" style={{ color: "#ff4444", fontSize: "12px", marginTop: "5px", display: "block" }}>
                  {errors.email}
                </span>
              )}
            </div>

            <div className="wrap-input" style={{ position: "relative" }}>
              <input
                className={password !== "" ? "has-val input" : "input"}
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  // Clear error when user starts typing
                  if (errors.password) {
                    setErrors({ ...errors, password: "" });
                  }
                }}
                disabled={loading}
                autoComplete="current-password"
                required
                style={{ paddingRight: "45px" }}
              />
              <span className="focus-input" data-placeholder="Password"></span>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#adadad",
                  padding: "5px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeSlashIcon style={{ width: "20px", height: "20px" }} />
                ) : (
                  <EyeIcon style={{ width: "20px", height: "20px" }} />
                )}
              </button>
              {errors.password && (
                <span className="error-message" style={{ color: "#ff4444", fontSize: "12px", marginTop: "5px", display: "block" }}>
                  {errors.password}
                </span>
              )}
            </div>

            <div className="container-login-form-btn">
              <button 
                type="submit"
                onClick={signin} 
                className="login-form-btn"
                disabled={loading}
                style={{ 
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? "not-allowed" : "pointer",
                  position: "relative",
                }}
              >
                {loading ? (
                  <>
                    <span style={{ marginRight: "8px" }}>Logging in...</span>
                    <span className="spinner" style={{
                      display: "inline-block",
                      width: "14px",
                      height: "14px",
                      border: "2px solid #fff",
                      borderTopColor: "transparent",
                      borderRadius: "50%",
                      animation: "spin 0.6s linear infinite",
                    }}></span>
                  </>
                ) : (
                  "Login"
                )}
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
    </>
  );
}

export default Login;
