document.addEventListener("DOMContentLoaded", () => {

    const btn = document.getElementById("loginBtn");

    btn.addEventListener("click", async () => {

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        if (!email || !password) {
            alert("Debes completar todos los campos.");
            return;
        }

        try {
            const res = await fetch("http://127.0.0.1:8000/api/v1/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (!res.ok) {
                alert("Error: " + data.detail);
                return;
            }

            // Guardar usuario
            localStorage.setItem("user", JSON.stringify({
                id: data.user_id,
                email: data.email,
                name: data.name,
                avatar: data.avatar
            }));

            window.location.href = "../screens/home.html";

        } catch (error) {
            console.error("Error de login:", error);
            alert("No se pudo conectar con el servidor.");
        }

    });
});
