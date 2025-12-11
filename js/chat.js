// ../js/chat.js

// URL del endpoint de chat en tu backend FastAPI
const CHAT_API_URL = "http://127.0.0.1:8000/api/v1/chat";

// Historial simple en memoria (por pestaña)
let tcChatHistory = [];

// Añadir mensaje al contenedor de chat
function tcAddMessageToUI(role, content) {
  const messagesContainer = document.getElementById("tc-chat-messages");
  if (!messagesContainer) return;

  const wrapper = document.createElement("div");
  wrapper.classList.add("tc-chat-row");

  const msgEl = document.createElement("div");
  msgEl.classList.add("tc-chat-message", `tc-chat-${role}`, "glass-xs");

  msgEl.textContent = content;

  wrapper.appendChild(msgEl);
  messagesContainer.appendChild(wrapper);

  // Scroll al final
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Enviar mensaje al backend
async function tcSendMessageToBackend(userText) {
  // Añadimos el mensaje del usuario al historial
  tcChatHistory.push({ role: "user", content: userText });

  try {
    const response = await fetch(CHAT_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: tcChatHistory,
      }),
    });

    if (!response.ok) {
      let errorMsg = `Error del servidor (${response.status}).`;
      try {
        const errorData = await response.json();
        if (errorData && errorData.detail) {
          errorMsg = errorData.detail;
        }
      } catch (e) {
        // ignoramos errores al parsear JSON de error
      }

      tcAddMessageToUI(
        "assistant",
        "⚠️ Ha ocurrido un problema al contactar con el asistente: " + errorMsg
      );
      return;
    }

    const data = await response.json();
    const reply = data.reply || "No he podido generar una respuesta válida.";

    // Guardamos respuesta en el historial
    tcChatHistory.push({ role: "assistant", content: reply });

    // Pintamos en la UI
    tcAddMessageToUI("assistant", reply);
  } catch (err) {
    console.error("Error llamando al chat:", err);
    tcAddMessageToUI(
      "assistant",
      "⚠️ Error de conexión con el asistente. Revisa tu conexión o inténtalo más tarde."
    );
  }
}

// Inicializar el widget
function tcInitChatWidget() {
  const toggleBtn = document.getElementById("tc-chat-toggle");
  const panel = document.getElementById("tc-chat-panel");
  const closeBtn = document.getElementById("tc-chat-close");
  const form = document.getElementById("tc-chat-form");
  const input = document.getElementById("tc-chat-input");
  const messagesContainer = document.getElementById("tc-chat-messages");

  // Si esta página no tiene widget, salimos
  if (!toggleBtn || !panel || !closeBtn || !form || !input || !messagesContainer) {
    return;
  }

  // Mensaje de bienvenida solo una vez por carga de página
  if (tcChatHistory.length === 0) {
    const welcomeMsg =
      "👋 Hola, soy TechCareer Assistant. Puedo ayudarte a entender cómo usar la plataforma " +
      "o resolver dudas generales sobre tecnología y carrera profesional. ¿En qué te ayudo?";
    tcChatHistory.push({ role: "assistant", content: welcomeMsg });
    tcAddMessageToUI("assistant", welcomeMsg);
  }

  // Abrir/cerrar panel
  toggleBtn.addEventListener("click", () => {
    panel.classList.toggle("tc-chat-hidden");
  });

  closeBtn.addEventListener("click", () => {
    panel.classList.add("tc-chat-hidden");
  });

  // Enviar mensaje
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    // Añadimos a la UI el mensaje del usuario
    tcAddMessageToUI("user", text);

    // Limpiamos el input
    input.value = "";

    // Mandamos al backend
    await tcSendMessageToBackend(text);
  });
}

// Iniciar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", tcInitChatWidget);
