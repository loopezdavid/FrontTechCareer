console.log("register.js cargado");

let selectedAvatarBase64 = null;

const fileInput = document.getElementById("photo");
const previewImg = document.getElementById("preview");

// Cargar foto seleccionada
fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
        selectedAvatarBase64 = reader.result;
        previewImg.src = selectedAvatarBase64;
        previewImg.style.display = "block";
    };
    reader.readAsDataURL(file);
});

// Botón de crear cuenta
document.getElementById("registerBtn").addEventListener("click", async () => {
    console.log("CLICK DETECTADO");

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const pass1 = document.getElementById("password1").value.trim();
    const pass2 = document.getElementById("password2").value.trim();

    if (!name || !email || !pass1 || !pass2) {
        alert("Todos los campos son obligatorios");
        return;
    }

    if (pass1 !== pass2) {
        alert("Las contraseñas no coinciden");
        return;
    }

    try {
        const res = await fetch("http://127.0.0.1:8000/api/v1/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: name,
                email: email,
                password: pass1,
                avatar: selectedAvatarBase64 || null
            })
        });

        const data = await res.json();

        if (!res.ok) {
            console.error("ERROR EN REGISTRO:", data);
            alert("Error: " + (data.detail || "No se pudo crear la cuenta"));
            return;
        }

        alert("Cuenta creada correctamente");
        window.location.href = "./login.html";

    } catch (err) {
        console.error("ERROR FETCH:", err);
        alert("Error al conectar con el servidor");
    }
});
