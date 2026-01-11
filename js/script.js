/**
 * LÓGICA DE LA INVITACIÓN - HOT WHEELS
 * Maneja la búsqueda, validación y envío de datos a Google Sheets.
 */

// URL DE TU WEB APP DE GOOGLE SCRIPTS
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzTkK5VN8kMME4Eu8opy5KFCECc47eHWS-kjwpEQjMRMKX_6wTQk3INJIgy_KkUiYxA/exec"; 

// BASE DE DATOS DE INVITADOS (CÓDIGO : [LISTA DE NOMBRES])
const DATABASE = {
  "482": ["Doña Rosy", "Don Juve"],

  "739": ["Rosy", "Isabel", "Sofía", "Rebeca"],

  "156": ["Elsa", "Héctor", "Héctor", "Itzel"],

  "904": ["Marco", "Ceci", "Christian", "Alexa"],

  "267": ["Dany", "Mayté", "Gerson", "Yasuri", "Dylan"],

  "581": ["Ramiro", "Victoria"],

  "823": ["Mónica", "Daniel", "Ivanna"],

  "349": ["Daniela", "Humberto"],

  "670": ["Martha", "Emilio"],

  "198": ["Armando", "Erika", "Alanna", "Amanda"],

  "754": ["Erika", "Pato"],

  "416": ["Ceci", "Alan", "Ángel"],

  "905": ["Marcela", "Valeria", "Luis", "Bebé"],

  "238": ["Nayeli", "Ivanna", "Luciana"],

  "691": ["Bere", "Isabella"],

  "547": ["Laura", "Emiliano", "Vale"],

  "862": ["Lucero", "Michelle", "Yoyo"],

  "310": ["Javier", "Karla", "Analía", "Elías"],

  "974": ["Joanna", "Janaí"],

  "425": ["Sandra", "Lía", "Elián"],

  "608": ["Brenda", "Angela"],

  "791": ["Perla", "Luis", "Mía"],

  "153": ["Jessy", "Rodrigo", "Zoe"],

  "174": ["Debany Guerrero"]

};

let invitadosActuales = [];
let estadosAsistencia = {}; 

/**
 * CONFIGURACIÓN DEL COUNTDOWN
 * Ajustado para el HTML proporcionado: Días, Horas, Minutos, Segundos.
 * Fecha objetivo: 25 de Enero de 2026, 11:00 AM
 */
function iniciarCountdown() {
    const fechaMeta = new Date("January 25, 2026 11:00:00").getTime();

    const intervalo = setInterval(() => {
        const ahora = new Date().getTime();
        const distancia = fechaMeta - ahora;

        // Elementos del DOM
        const d = document.getElementById("days");
        const h = document.getElementById("hours");
        const m = document.getElementById("minutes");
        const s = document.getElementById("seconds");

        if (distancia < 0) {
            clearInterval(intervalo);
            if(d) d.innerText = "00";
            if(h) h.innerText = "00";
            if(m) m.innerText = "00";
            if(s) s.innerText = "00";
            return;
        }

        const dias = Math.floor(distancia / (1000 * 60 * 60 * 24));
        const horas = Math.floor((distancia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutos = Math.floor((distancia % (1000 * 60 * 60)) / (1000 * 60));
        const segundos = Math.floor((distancia % (1000 * 60)) / 1000);

        // Actualizar el HTML con formato de dos dígitos
        if(d) d.innerText = dias < 10 ? "0" + dias : dias;
        if(h) h.innerText = horas < 10 ? "0" + horas : horas;
        if(m) m.innerText = minutos < 10 ? "0" + minutos : minutos;
        if(s) s.innerText = segundos < 10 ? "0" + segundos : segundos;
    }, 1000);
}

        // Asegura que el cronómetro inicie cuando el DOM esté listo
        document.addEventListener('DOMContentLoaded', function() {
            if (typeof iniciarCountdown === 'function') {
                iniciarCountdown();
            }
        });


/**
 * Busca si el código ingresado existe y si ya fue registrado
 */
async function buscarCodigo() {
    const codeInput = document.getElementById('code-input');
    const code = codeInput.value.trim();
    const error = document.getElementById('error-msg');
    const btn = document.getElementById('btn-search');
    
    if (!DATABASE[code]) {
        error.textContent = "CÓDIGO NO VÁLIDO";
        return;
    }

    btn.disabled = true;
    btn.textContent = "VERIFICANDO...";

    try {
        // Consultar a Google Sheets si el código ya fue usado
        const response = await fetch(`${WEB_APP_URL}?checkCode=${code}`);
        const result = await response.json();

        if (result.exists) {
            mostrarYaRegistrado();
        } else {
            invitadosActuales = DATABASE[code];
            estadosAsistencia = {};
            // Inicializar estados como nulos
            invitadosActuales.forEach((_, i) => estadosAsistencia[i] = null);
            mostrarLista(invitadosActuales);
        }
    } catch (e) {
        // Fallback en caso de error de red
        console.warn("Error de verificación, procediendo con lista local.");
        invitadosActuales = DATABASE[code];
        estadosAsistencia = {};
        invitadosActuales.forEach((_, i) => estadosAsistencia[i] = null);
        mostrarLista(invitadosActuales);
    } finally {
        btn.disabled = false;
        btn.textContent = "REVISAR CÓDIGO";
    }
}

/**
 * Cambia el estado de asistencia de un invitado individual
 */
function toggleAsistencia(index, valor) {
    estadosAsistencia[index] = valor;
    
    const btnSi = document.getElementById(`btn-si-${index}`);
    const btnNo = document.getElementById(`btn-no-${index}`);
    
    if (valor === "SI") {
        btnSi.classList.add('active-si');
        btnSi.classList.remove('text-slate-400');
        btnNo.classList.remove('active-no');
    } else {
        btnSi.classList.remove('active-si');
        btnNo.classList.add('active-no');
        btnNo.classList.remove('text-slate-400');
    }
    
    validarFormulario();
}

/**
 * Habilita el botón de enviar solo si todos los invitados tienen selección
 */
function validarFormulario() {
    const btnConfirmar = document.getElementById('btn-confirm');
    const todosSeleccionados = Object.values(estadosAsistencia).every(val => val !== null);
    btnConfirmar.disabled = !todosSeleccionados;
}

/**
 * Genera el HTML de la lista de invitados dinámicamente
 */
function mostrarLista(lista) {
    const container = document.getElementById('guest-list');
    container.innerHTML = "";
    
    lista.forEach((nombre, index) => {
        const item = document.createElement('div');
        item.className = "flex flex-col sm:flex-row items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 gap-3";
        item.innerHTML = `
            <span class="font-bold text-slate-700 text-sm text-center sm:text-left">${nombre}</span>
            <div class="flex gap-2">
                <button id="btn-si-${index}" onclick="toggleAsistencia(${index}, 'SI')" class="option-btn px-4 py-1.5 rounded-lg text-[10px] font-black min-w-[65px]">SÍ</button>
                <button id="btn-no-${index}" onclick="toggleAsistencia(${index}, 'NO')" class="option-btn px-4 py-1.5 rounded-lg text-[10px] font-black min-w-[65px]">NO</button>
            </div>
        `;
        container.appendChild(item);
    });
    
    document.getElementById('view-search').classList.add('hidden');
    document.getElementById('view-result').classList.remove('hidden');
}

/**
 * Muestra pantalla de bloqueo si el código ya se usó
 */
function mostrarYaRegistrado() {
    document.getElementById('view-search').classList.add('hidden');
    document.getElementById('view-already').classList.remove('hidden');
}

/**
 * Envía los datos finales a Google Sheets
 */
async function enviarConfirmacion() {
    const btn = document.getElementById('btn-confirm');
    const codigoInput = document.getElementById('code-input').value;
    
    btn.disabled = true;
    btn.textContent = "ENVIANDO...";

    // Estructuramos los datos para que Google Sheets los reciba correctamente
    const respuestas = invitadosActuales.map((nombre, index) => ({
        nombre: nombre,
        asistencia: estadosAsistencia[index],
        codigo: codigoInput,
        fecha: new Date().toLocaleString()
    }));

    try {
        await fetch(WEB_APP_URL, {
            method: 'POST',
            mode: 'no-cors', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: respuestas })
        });

        dispararConfeti();
        const asistiran = respuestas.filter(r => r.asistencia === "SI").length;
        document.getElementById('modal-text').textContent = `¡Confirmación recibida! ${asistiran} confirmados para la FIESTA.`;
        document.getElementById('modal').classList.remove('hidden');
        
    } catch(e) {
        console.error("Error al enviar:", e);
        btn.disabled = false;
        btn.textContent = "REINTENTAR";
    }
}

/**
 * Efecto visual de celebración - Ráfagas de confeti laterales por 15 segundos
 */
function dispararConfeti() {
    const duration = 15 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { 
        startVelocity: 30, 
        spread: 360, 
        ticks: 60, 
        zIndex: 9999, // Asegurar que se vea sobre el modal
        colors: ['#facc15', '#1e3a8a', '#ef4444'] // Amarillo, Azul y Rojo Hot Wheels
    };

    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        
        // Disparo desde la izquierda
        confetti({ 
            ...defaults, 
            particleCount, 
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } 
        });
        
        // Disparo desde la derecha
        confetti({ 
            ...defaults, 
            particleCount, 
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } 
        });
    }, 250);
}
/**
 * Vuelve a la pantalla inicial
 */
function regresar() {
    document.getElementById('view-search').classList.remove('hidden');
    document.getElementById('view-result').classList.add('hidden');
    document.getElementById('view-already').classList.add('hidden');
    document.getElementById('error-msg').textContent = "";
}
/**
 * Fotografia
 */
const lightbox = document.getElementById('lightbox');
        const lightboxImg = document.getElementById('lightbox-img');
        const sourceImg = document.querySelector('.responsive-img');

        function openLightbox() {
            lightboxImg.src = sourceImg.src;
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden'; // Evita scroll al estar abierto
        }

        function closeLightbox() {
            lightbox.classList.remove('active');
            document.body.style.overflow = ''; // Restaura el scroll
        }

        // Cerrar con la tecla Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeLightbox();
        });