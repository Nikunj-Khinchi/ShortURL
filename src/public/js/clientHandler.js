// Firebase configuration dynamically injected by the server
// Initialize Firebase

firebase.initializeApp(window.firebaseConfig);
const auth = firebase.auth();

document.addEventListener("DOMContentLoaded", async () => {
    const idToken = localStorage.getItem("idToken");
    if (idToken) {
        await loadAnalytics(idToken);
    }

    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            document.getElementById("userName").innerText = `Name: ${user.displayName}`;
            document.getElementById("userEmail").innerText = `Email: ${user.email}`;
            document.getElementById("userPicture").src = user.photoURL;

            document.getElementById("authSection").style.display = "none";
            document.getElementById("userInfo").style.display = "block";
        }
    });
});

document.getElementById("googleSignIn").addEventListener("click", async () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
        const result = await auth.signInWithPopup(provider);
        const idToken = await result.user.getIdToken();
        localStorage.setItem("idToken", idToken);
        await loadAnalytics(idToken);
    } catch (error) {
        console.error("Google Sign-In failed:", error);
        document.getElementById("authError").innerText = `Google Sign-In failed: ${error.message}`;
        document.getElementById("authError").style.display = "block";
    }
});

document.getElementById("logout").addEventListener("click", () => {
    auth.signOut().then(() => {
        localStorage.removeItem("idToken");
        document.getElementById("authSection").style.display = "block";
        document.getElementById("userInfo").style.display = "none";
        document.getElementById("analyticsSection").style.display = "none";
        alert("Logged out successfully!");
    }).catch((error) => {
        console.error("Logout failed:", error);
        document.getElementById("authError").innerText = `Logout failed: ${error.message}`;
        document.getElementById("authError").style.display = "block";
    });
});

document.getElementById("shortUrlForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const idToken = localStorage.getItem("idToken");
    if (!idToken) {
        alert("You need to sign in first.");
        return;
    }

    const longUrl = document.getElementById("longUrl").value;
    const topic = document.getElementById("topic").value;
    const customAlias = document.getElementById("customAlias").value;

    const payload = { longUrl, topic, customAlias: customAlias || null };

    try {
        const response = await fetch(`${window.baseUrl}/api/shorten/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": idToken,
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();
        if (response.ok) {
            document.getElementById("shortUrlLink").href = data.data.shortUrl;
            document.getElementById("shortUrlLink").innerText = data.data.shortUrl;
            document.getElementById("createdAt").innerText = `Created At: ${new Date(data.data.createdAt).toLocaleString()}`;
            document.getElementById("shortUrlResult").style.display = "block";
            document.getElementById("shortUrlError").style.display = "none";
            await loadAnalytics(idToken);
        } else {
            document.getElementById("shortUrlError").innerText = `Failed to create Short URL: ${data.message}`;
            document.getElementById("shortUrlError").style.display = "block";
        }
    } catch (error) {
        console.error("Error creating Short URL:", error);
        document.getElementById("shortUrlError").innerText = `Error creating Short URL: ${error.message}`;
        document.getElementById("shortUrlError").style.display = "block";
    }
});

async function loadAnalytics(idToken) {
    try {
        const response = await fetch(`${window.baseUrl}/api/analytics/overall`, {
            headers: {
                "Authorization": idToken,
            },
        });
        const data = await response.json();
        if (response.ok) {
            document.getElementById("totalUrls").innerText = data.totalUrls;
            document.getElementById("totalClicks").innerText = data.totalClicks;
            document.getElementById("uniqueClicks").innerText = data.uniqueClicks;

            const urlsTableBody = document.getElementById("urlsTableBody");
            urlsTableBody.innerHTML = data.urls.map(url => `
                <tr>
                    <td><a href="${window.baseUrl}/api/shorten/${url.shortUrl}" target="_blank" >${url.shortUrl}</a></td>
                    <td>${url.longUrl}</td>
                    <td>${url.totalClicks}</td>
                    <td>${url.uniqueClicks}</td>
                </tr>
            `).join("");

            document.getElementById("analyticsSection").style.display = "block";
            document.getElementById("analyticsError").style.display = "none";
        } else {
            console.error("Failed to load analytics:", data.message);
            if(data.message === "No URLs found for the specified user"){
            document.getElementById("analyticsError").innerText = `${data.message}`;      
            }else{
            document.getElementById("analyticsError").innerText = `Failed to load analytics: ${data.message}`;
            }
            document.getElementById("analyticsError").style.display = "block";
        }
    } catch (error) {
        console.error("Error fetching analytics:", error);
        document.getElementById("analyticsError").innerText = `Error fetching analytics: ${error.message}`;
        document.getElementById("analyticsError").style.display = "block";
    }
}