import {
  createUserWithEmailAndPassword,
  getAuth,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import { GoogleAuthProvider } from "firebase/auth";
import { useRef, useState } from "react";
import "./App.css";
import app from "./firebase.init";

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

function App() {
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const [newUser, setNewUser] = useState(true);
  const [passwordShown, setPasswordShown] = useState(false);
  const [resetPassword, setResetPassword] = useState(false);
  const [user, setUser] = useState({
    isSignedIn: false,
    name: "",
    email: "",
    password: "",
    photo: "",
    error: "",
    success: false,
    emailVerified: false,
    passwordReset: false,
    emailVerifiedNote: false,
  });

  const [userError, setUserError] = useState({
    nameError: "",
    emailError: "",
    passwordError: "",
  });

  // Google sign in and sign out process
  const handleGoogleSignIn = () => {
    signInWithPopup(auth, provider)
      .then((res) => {
        const { displayName, email, photoURL } = res.user;

        const isSignedInUser = {
          isSignedIn: true,
          name: displayName,
          email: email,
          photo: photoURL,
          success: true,
        };
        const newSignedInUser = { ...user, ...isSignedInUser };
        setUser(newSignedInUser);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleGoogleSignOut = () => {
    signOut(auth).then(() => {
      setUser({});
    });
  };

  // Create user with name, email and password process
  const togglePassword = () => {
    setPasswordShown(!passwordShown);
  };
  const handleChange = (e) => {
    console.log(e.target.value);
    if (e.target.name === "name") {
      if (e.target.value.length < 10) {
        setUserError({});
      } else if (e.target.value.length > 10) {
        const newUserError = { ...userError };
        newUserError["nameError"] = "pattern: maximum 10 letters name";
        setUserError(newUserError);
      }
    }
    if (e.target.name === "email") {
      if (/\S+@\S+\.\S+/.test(e.target.value)) {
        setUserError({});
      } else if (e.target.value.length < 2) {
        setUserError({});
      } else if (/\S+@/.test(e.target.value)) {
        setUserError({});
      } else if (e.target.value.length > 2) {
        const newUserError = { ...userError };
        newUserError["emailError"] = "pattern: sada@kala.com";
        setUserError(newUserError);
      }
    }
    if (e.target.name === "password") {
      if (e.target.value.length > 5 && /^[A-Za-z0-9]*$/.test(e.target.value)) {
        setUserError({});
      } else if (e.target.value.length < 2) {
        setUserError({});
      } else if (e.target.value.length > 2) {
        const newUserError = { ...userError };
        newUserError[
          "passwordError"
        ] = `pattern: minimum 6 characters as like "password2904"`;
        setUserError(newUserError);
      }
    }
  };

  const handleBlur = (e) => {
    let isFieldValid = true;
    if (e.target.name === "name") {
      const maxNameField = e.target.value.length < 10;
      isFieldValid = maxNameField;
    }
    if (e.target.name === "email") {
      const machField = /\S+@\S+\.\S+/.test(e.target.value);
      isFieldValid = machField;
    }
    if (e.target.name === "password") {
      const isPasswordValid = e.target.value.length > 6;
      const onlyHasLetterAndNumber = /^[A-Za-z0-9]*$/.test(e.target.value);
      isFieldValid = isPasswordValid && onlyHasLetterAndNumber;
    }
    if (isFieldValid) {
      const newUserInfo = { ...user };
      newUserInfo[e.target.name] = e.target.value;
      setUser(newUserInfo);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (newUser && user.email && user.password) {
      createUserWithEmailAndPassword(auth, user.email, user.password)
        .then((res) => {
          const newUserInfo = { ...user };
          newUserInfo.error = "";
          newUserInfo.success = true;
          setUser(newUserInfo);
          updateUserName(user.name);
          emailVerification();
          nameRef.current.value = "";
          emailRef.current.value = "";
          passwordRef.current.value = "";
          setTimeout(() => {
            setUser({});
            console.log("Delayed for 10 second.");
          }, 10000);
        })
        .catch((error) => {
          const newUserError = { ...user };
          console.log(error);
          newUserError.error = error.message;
          newUserError.success = false;
          setUser(newUserError);
        });
    }
    if (!newUser && user.email && user.password) {
      signInWithEmailAndPassword(auth, user.email, user.password)
        .then((res) => {
          if (res.user.emailVerified) {
            const newUserInfo = { ...user };
            newUserInfo.error = "";
            newUserInfo.success = true;
            newUserInfo.emailVerified = true;
            setUser(newUserInfo);
            emailRef.current.value = "";
            passwordRef.current.value = "";
            setTimeout(() => {
              setUser({});
              console.log("Delayed for 10 second.");
            }, 10000);
          } else {
            const newUserError = { ...user };
            newUserError.error = "Your email not verified";
            setUser(newUserError);
          }
        })
        .catch((error) => {
          const newUserError = { ...user };
          newUserError.error = error.message;
          newUserError.success = false;
          setUser(newUserError);
        });
    }
  };

  const updateUserName = (name) => {
    updateProfile(auth.currentUser, {
      displayName: name,
    })
      .then(() => {
        console.log("user profile update successfully");
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const emailVerification = () => {
    sendEmailVerification(auth.currentUser).then(() => {
      const userInfo = { ...user };
      userInfo["emailVerifiedNote"] = true;
      setUser(userInfo);
    });
  };

  const handleResetPassword = () => {
    if (user.email) {
      sendPasswordResetEmail(auth, user.email)
        .then(() => {
          const userInfo = { ...user };
          userInfo["passwordReset"] = true;
          emailRef.current.value = "";
          setUser(userInfo);
          setTimeout(() => {
            setUser({});
            console.log("Delayed for 10 second.");
          }, 10000);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };

  return (
    <>
      <div className="flex flex-col items-center w-full bg-teal-200 px-6 h-screen">
        <div className="mt-5">
          {user.isSignedIn ? (
            <button
              onClick={handleGoogleSignOut}
              className="px-4 py-2 bg-amber-500 rounded-full hover:bg-amber-600 font-semibold"
            >
              Google Sign out
            </button>
          ) : (
            <button
              onClick={handleGoogleSignIn}
              className="px-4 py-2 bg-amber-500 rounded-full hover:bg-amber-600 font-semibold"
            >
              Google Sign in
            </button>
          )}
        </div>
        <div className="w-full bg-white rounded shadow-lg p-8 m-4 md:max-w-sm md:mx-auto">
          <h1 className="block w-full text-center text-gray-700 mb-6 font-semibold">
            {resetPassword ? (
              "Type your email address and click submit button"
            ) : (
              <>
                {!newUser
                  ? "Sign in with your email and password"
                  : "Sign up with your name, email and password"}
              </>
            )}
          </h1>
          <form
            onSubmit={handleFormSubmit}
            className="mb-4 md:flex md:flex-wrap md:justify-between"
          >
            {!resetPassword && newUser && (
              <div className="flex flex-col mb-4 md:w-full">
                <label className="mb-2 uppercase font-bold text-m text-gray-700">
                  Your name
                </label>
                <input
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="border py-2 px-3 text-gray-700"
                  type="text"
                  name="name"
                  required
                  ref={nameRef}
                />
                <small className=" text-red-600 ">{userError.nameError}</small>
              </div>
            )}

            {/* <div className="flex flex-col mb-4 md:w-1/2">
                <label
                  className="mb-2 uppercase font-bold text-m text-gray-700 md:ml-2"
                  for="last_name"
                >
                  Last Name
                </label>
                <input
                  onBlur={handleBlur}
                  className="border py-2 px-3 text-gray-700 md:ml-2"
                  type="text"
                  name="last_name"
                  id="last_name"
                  required
                />
              </div> */}
            <div className="flex flex-col mb-4 md:w-full">
              <label className="mb-2 uppercase font-bold text-m text-gray-700">
                Email
              </label>
              <input
                onChange={handleChange}
                onBlur={handleBlur}
                className="border py-2 px-3 text-gray-700"
                type="email"
                name="email"
                required
                ref={emailRef}
              />
              <small className=" text-red-600 ">{userError.emailError}</small>
            </div>
            {!resetPassword && (
              <div className="flex flex-col mb-6 md:w-full">
                <label className="mb-2 uppercase font-bold text-m text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="border py-2 px-3 text-gray-700 block w-full"
                    type={passwordShown ? "text" : "password"}
                    name="password"
                    id="password"
                    required
                    ref={passwordRef}
                  />
                  <button
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm"
                    onClick={togglePassword}
                  >
                    {passwordShown ? "Hide" : "Show"}
                  </button>
                </div>

                <small className=" text-red-600 ">
                  {userError.passwordError}
                </small>
              </div>
            )}
            {!resetPassword && (
              <input
                className="block bg-teal-500 hover:bg-teal-700 text-white uppercase text-lg mx-auto px-2 py-1 rounded cursor-pointer"
                type="submit"
                value={!newUser ? "Sign In" : "Sign Up"}
              />
            )}
            {resetPassword && (
              <button
                onClick={handleResetPassword}
                className="block bg-teal-500 hover:bg-teal-700 text-white uppercase text-lg mx-auto px-2 py-1 rounded cursor-pointer"
              >
                Submit
              </button>
            )}
          </form>
          <div>
            {!resetPassword && (
              <div className=" flex flex-row justify-center w-full text-center text-md text-gray-600 gap-2 font-semibold">
                <input
                  className="w-4 accent-teal-500"
                  type="checkbox"
                  name="newUser"
                  id=""
                  onChange={() => setNewUser(!newUser)}
                />
                <label htmlFor="newUser">Already have an account?</label>
              </div>
            )}

            <div className="flex flex-row justify-center w-full text-center text-md text-orange-600 gap-2 font-semibold">
              <input
                onChange={() => setResetPassword(!resetPassword)}
                className="w-4 accent-orange-600"
                type="checkbox"
                name="resetPassword"
              />
              <label htmlFor="resetPassword">Forget your password !</label>
            </div>
          </div>

          <div className="flex flex-col justify-center items-center py-2">
            <p className=" text-red-600">{user.error}</p>
            {user.success && (
              <p className=" text-green-600">
                User {newUser ? "created" : "signed in"} successfully
              </p>
            )}
            {user.emailVerifiedNote && (
              <p className=" text-purple-600">
                Check your inbox to verify email
              </p>
            )}
            {user.passwordReset && (
              <p className=" text-purple-600">
                Check your inbox for reset password
              </p>
            )}
          </div>
        </div>
        {/* <div className="flex flex-col">
          <img src={user.photo} alt="profile" />
          <small>Name: {user.name}</small>
          <small>Email: {user.email}</small>
          <small>Password: {user.password}</small>
        </div> */}
      </div>
    </>
  );
}

export default App;
