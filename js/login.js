localStorage.removeItem('email')
localStorage.removeItem('isLoggedIn')

function checkInfo() {

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if(email && password.length >= 5) {
    // Local storage
        localStorage.setItem('email', email); // Use Local Storage to set items
        localStorage.setItem('isLoggedIn', 'true')
    } else {
        return false
    }
}