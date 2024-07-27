import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCXf5k11V1EgvxnjjFVzVpFqCbCCyCz4Ow",
    authDomain: "mka-accountauthentication.firebaseapp.com",
    projectId: "mka-accountauthentication",
    storageBucket: "mka-accountauthentication.appspot.com",
    messagingSenderId: "10168521939",
    appId: "1:10168521939:web:f3dd45947f2c013c42f026",
    measurementId: "G-LZMC28WDT8"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("Authentified Succesfully!");
    } else {
      console.log("Redirecting to authentication page.....")
        localStorage.setItem('pendingSite', window.location.href)
      window.location.href='https://mkumail14.github.io/authentication/'

          }
});

async function logout() {
    try {
        await signOut(auth);
        localStorage.clear();
        localStorage.setItem('pendingSite', window.location.href)
        console.log("Sign-out successful.");
    } catch (error) {
        console.error(error);
    }
}

window.logout = logout;
