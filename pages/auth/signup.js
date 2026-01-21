import { useState } from "react";
import { useRouter } from "next/router";
import "../../styles/login.module.css";
import Link from "next/link";
import { addDataFromApi } from "@/utils/api";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

/**
 * Signup page component
 * Handles new user registration with validation
 */
function Signup() {
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const router = useRouter();

  /**
   * Validate form inputs
   * @returns {boolean} - True if valid, false otherwise
   */
  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!name || name.trim() === "") {
      newErrors.name = "Name is required";
    } else if (name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // Email validation
    if (!email || email.trim() === "") {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Mobile validation
    if (!mobile || mobile.trim() === "") {
      newErrors.mobile = "Mobile number is required";
    } else if (!/^[0-9]{10,15}$/.test(mobile.trim().replace(/[\s\-\(\)]/g, ""))) {
      newErrors.mobile = "Please enter a valid mobile number (10-15 digits)";
    }

    // Password validation
    if (!password || password.trim() === "") {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    } else if (password.length > 128) {
      newErrors.password = "Password must be less than 128 characters";
    }

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      const firstError = Object.values(newErrors)[0];
      toast.error(firstError, {
        position: "top-right",
        autoClose: 3000,
        theme: "dark",
      });
      return false;
    }

    return true;
  };

  /**
   * Handle signup form submission
   * @param {Event} e - Form submit event
   */
  const signup = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      const body = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        mobile: mobile.trim(),
        password: password,
      };

      const res = await addDataFromApi("signup", body);

      if (res?.accessToken || res?.statusCode === 201) {
        // Success - save token and redirect
        if (res.accessToken) {
          Cookies.set("404Token", res.accessToken);
        }

        toast.success("Signup successful! Redirecting...", {
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
        const errorMessage = res?.message || "Signup failed. Please try again.";
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
      console.error("Signup error:", error);
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
            <form className="login-form" onSubmit={signup}>
              <span className="login-form-title">Welcome to Signup</span>

            <div className="wrap-input">
              <input
                className={name ? "has-val input" : "input"}
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) {
                    setErrors({ ...errors, name: "" });
                  }
                }}
                disabled={loading}
                autoComplete="name"
                required
              />
              <span className="focus-input" data-placeholder="Name"></span>
              {errors.name && (
                <span className="error-message" style={{ color: "#ff4444", fontSize: "12px", marginTop: "5px", display: "block" }}>
                  {errors.name}
                </span>
              )}
            </div>

            <div className="wrap-input">
              <input
                className={email ? "has-val input" : "input"}
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
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

            <div className="wrap-input">
              <input
                className={mobile ? "has-val input" : "input"}
                type="tel"
                value={mobile}
                onChange={(e) => {
                  setMobile(e.target.value);
                  if (errors.mobile) {
                    setErrors({ ...errors, mobile: "" });
                  }
                }}
                disabled={loading}
                autoComplete="tel"
                required
              />
              <span className="focus-input" data-placeholder="Mobile"></span>
              {errors.mobile && (
                <span className="error-message" style={{ color: "#ff4444", fontSize: "12px", marginTop: "5px", display: "block" }}>
                  {errors.mobile}
                </span>
              )}
            </div>

            <div className="wrap-input" style={{ position: "relative" }}>
              <input
                className={password ? "has-val input" : "input"}
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) {
                    setErrors({ ...errors, password: "" });
                  }
                }}
                disabled={loading}
                autoComplete="new-password"
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
                    <span style={{ marginRight: "8px" }}>Signing up...</span>
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
                  "Signup"
                )}
              </button>
            </div>

            <div className="text-center">
              <span className="txt1">Have an account? </span>
              <Link className="txt2" href="/auth/login">
                Login Here
              </Link>
            </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default Signup;
