document.addEventListener("DOMContentLoaded", () => { 
    const authArea = document.getElementById("authArea");
    if (!authArea) return;

    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
        authArea.innerHTML = `
            <button class="btn ghost" onclick="goTo('login')">Login</button>
        `;
        return;
    }

    // SI TIENE AVATAR EN BASE64, SE USA. SI NO, SE USA UNA IMAGEN POR DEFECTO.
    const avatarSrc = user.avatar || "../assets/user-svgrepo-com.svg.jpg";

    authArea.innerHTML = `
        <div class="profile-menu-container" style="position:relative;">
            <img id="profileBtn" src="${avatarSrc}"
                 style="width:36px;height:36px;border-radius:50%;cursor:pointer;object-fit:cover;">
            
            <div id="dropdownMenu" style="
                position:absolute;
                top:48px;
                right:0;
                display:none;
                background:rgba(255,255,255,0.05);
                backdrop-filter:blur(8px);
                border-radius:10px;
                border:1px solid rgba(255,255,255,0.1);
                padding:10px;
                min-width:160px;
                box-shadow:0 8px 30px rgba(0,0,0,0.4);
                z-index:99;
            ">
                <div class="dropdown-item" onclick="goTo('profile')">Mi Perfil</div>
                <div class="dropdown-item" onclick="goTo('settings')">Editar Perfil</div>
                <div class="dropdown-item" onclick="logout()" style="color:#f88;">Cerrar sesión</div>
            </div>
        </div>
    `;

    const btn = document.getElementById("profileBtn");
    const menu = document.getElementById("dropdownMenu");

    btn.addEventListener("click", () => {
        menu.style.display = menu.style.display === "block" ? "none" : "block";
    });

    document.addEventListener("click", (e) => {
        if (!authArea.contains(e.target)) {
            menu.style.display = "none";
        }
    });
});

function logout() {
    localStorage.removeItem("user");
    location.reload();
}
