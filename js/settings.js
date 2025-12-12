console.log("settings.js cargado");

// cargar user
const user = JSON.parse(localStorage.getItem("user"));
if (!user) location.href = "./login.html";

// rellenar inputs
document.getElementById("name").value = user.name;
document.getElementById("email").value = user.email;

let newAvatar = null;

// elementos
const avatarInput = document.getElementById("avatarInput");
const avatarPreview = document.getElementById("avatarPreview");
const changePhotoBtn = document.getElementById("changePhotoBtn");

// mostrar avatar actual
if (user.avatar) {
    avatarPreview.src = user.avatar;
    avatarPreview.style.display = "block";
}

// abrir selector
changePhotoBtn.addEventListener("click", () => {
    avatarInput.click();
});

// procesar nueva imagen
avatarInput.addEventListener("change", () => {
    const file = avatarInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
        newAvatar = reader.result;
        avatarPreview.src = newAvatar;
        avatarPreview.style.display = "block";
    };

    reader.readAsDataURL(file);
});

// guardar cambios
document.getElementById("saveBtn").addEventListener("click", async () => {

    const newName = document.getElementById("name").value.trim();
    const newEmail = document.getElementById("email").value.trim();
    const pass1 = document.getElementById("newPass1").value.trim();
    const pass2 = document.getElementById("newPass2").value.trim();

    if (pass1 && pass1 !== pass2) {
        alert("Las contraseñas no coinciden");
        return;
    }

    try {
        const res = await fetch(`http://127.0.0.1:8000/api/v1/auth/update/${user.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: newName || null,
                email: newEmail || null,
                password: pass1 || null,
                avatar: newAvatar || null
            })
        });

        const data = await res.json();

        if (!res.ok) {
            console.error("Error backend: ", data);
            alert(data.detail || "Error al guardar cambios");
            return;
        }

        // actualizar localStorage
        localStorage.setItem("user", JSON.stringify(data.updated_user));

        alert("Cambios guardados correctamente");
        location.reload();

    } catch (err) {
        console.error(err);
        alert("Error al conectar con el servidor");
    }
});
