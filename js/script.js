/**
 * LÓGICA DE LA INVITACIÓN - HOT WHEELS
 */

// --- CONFIGURACIÓN DE FECHA ---
const targetDate = new Date("January 24, 2026 16:00:00").getTime();

const countdownInterval = setInterval(function() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    const dEl = document.getElementById("days");
    const hEl = document.getElementById("hours");
    const mEl = document.getElementById("minutes");
    const sEl = document.getElementById("seconds");

    if (dEl) dEl.innerText = days.toString().padStart(2, '0');
    if (hEl) hEl.innerText = hours.toString().padStart(2, '0');
    if (mEl) mEl.innerText = minutes.toString().padStart(2, '0');
    if (sEl) sEl.innerText = seconds.toString().padStart(2, '0');

    if (distance < 0) {
        clearInterval(countdownInterval);
        const container = document.getElementById("countdown");
        if (container) container.innerHTML = "<p class='text-yellow-400 font-black text-4xl uppercase italic'>¡EN SUS MARCAS, LISTOS, YA!</p>";
    }
}, 1000);

// --- SCROLL ANIMADO PERSONALIZADO ---
document.querySelector('a[href="#confirmacion"]').addEventListener('click', function(e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');
    const targetElement = document.querySelector(targetId);
    
    targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
});

// --- APARECER BOTÓN CON RETRASO ---
window.addEventListener('load', () => {
    const mainBtn = document.getElementById('main-cta');
    // Aparece después de 3 segundos
    setTimeout(() => {
        if (mainBtn) {
            mainBtn.classList.remove('hidden-initially');
            mainBtn.classList.add('fade-in-up');
        }
    }, 1000);
});;


 // --- CONFIGURACIÓN ---
        const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbweOpTmuqMDyDTI1A3i1NNYeyC8MeBGXgk1VFZQbGoTfZV-jsze23Gmv3pkD58OdlXk/exec";
        
        // La lista debe tener nombres únicos preferiblemente con apellidos
        const LISTA_LOCAL = [
            { nombre: "Humberto Pérez Barajas", pases: 2 },
            { nombre: "Daniela Sánchez Ruiz", pases: 2 },
            { nombre: "Monica Sánchez Ruiz", pases: 2 },
        ];

        window.addEventListener('load', () => {
            setTimeout(() => {
                const btn = document.getElementById('main-cta');
                if (btn) {
                    btn.classList.remove('hidden-initially');
                    btn.classList.add('fade-in-up');
                }
            }, 3000);
        });

        function normalizar(texto) {
            return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
        }

        async function buscarInvitado() {
            const inputRaw = document.getElementById('name-input').value.trim();
            const btn = document.getElementById('btn-search');
            const error = document.getElementById('error-msg');
            
            // Validar que tenga al menos nombre y apellido
            const palabras = inputRaw.split(' ').filter(p => p.length > 0);
            if (palabras.length < 2) {
                error.textContent = "POR FAVOR, INGRESA NOMBRE Y APELLIDO";
                return;
            }

            btn.disabled = true;
            btn.textContent = "BUSCANDO...";
            error.textContent = "";

            const inputNorm = normalizar(inputRaw);
            
            // Buscar coincidencias exactas o contenidas
            const coincidencias = LISTA_LOCAL.filter(i => normalizar(i.nombre).includes(inputNorm));
            
            if (coincidencias.length === 0) {
                error.textContent = "PILOTO NO ENCONTRADO. VERIFICA EL NOMBRE.";
                btn.disabled = false;
                btn.textContent = "REVISAR LISTA";
            } else if (coincidencias.length === 1) {
                // Una sola coincidencia: proceder
                iniciarProcesoConfirmacion(coincidencias[0]);
            } else {
                // Más de una coincidencia: No mostramos la lista por privacidad.
                // Pedimos que sea más específico.
                error.innerHTML = "HAY VARIOS PILOTOS CON ESE NOMBRE.<br>POR FAVOR, ESCRIBE TU NOMBRE COMPLETO.";
                btn.disabled = false;
                btn.textContent = "REVISAR LISTA";
            }
        }

        async function iniciarProcesoConfirmacion(piloto) {
            const btn = document.getElementById('btn-search');
            btn.disabled = true;
            
            try {
                // Consultar al script si ya está registrado
                const resp = await fetch(WEB_APP_URL);
                const registrados = await resp.json();
                const ya = Array.isArray(registrados) && registrados.some(r => normalizar(r.nombre) === normalizar(piloto.nombre));
                
                window.invitadoData = { ...piloto, ya };
                mostrarResultados();
            } catch(e) {
                // Si falla la red, permitimos confirmación (luego fallará el POST o se guardará localmente)
                window.invitadoData = { ...piloto, ya: false };
                mostrarResultados();
            } finally {
                btn.disabled = false;
                btn.textContent = "REVISAR LISTA";
            }
        }

        function mostrarResultados() {
            document.getElementById('view-search').classList.add('hidden');
            document.getElementById('view-result').classList.remove('hidden');
            document.getElementById('res-name').textContent = window.invitadoData.nombre;
            
            const card = document.getElementById('status-card');
            card.className = "p-8 rounded-2xl border-4"; 
            
            if (window.invitadoData.ya) {
                card.classList.add('bg-red-50', 'border-red-500');
                document.getElementById('res-info').innerHTML = "<p class='text-red-600 font-black italic'>¡TU LUGAR YA ESTÁ RESERVADO!</p>";
                document.getElementById('confirm-panel').classList.add('hidden');
            } else {
                card.classList.add('bg-blue-50', 'border-blue-900');
                document.getElementById('res-info').innerHTML = `<p class='text-blue-900 font-black italic'>TIENES ${window.invitadoData.pases} PASES DE CORREDOR</p>`;
                poblarSelect(window.invitadoData.pases);
                document.getElementById('confirm-panel').classList.remove('hidden');
            }
        }

        function regresarBusqueda() {
            document.getElementById('view-search').classList.remove('hidden');
            document.getElementById('view-result').classList.add('hidden');
            document.getElementById('name-input').value = "";
            document.getElementById('error-msg').textContent = "";
        }

        function poblarSelect(max) {
            const s = document.getElementById('access-select');
            s.innerHTML = '<option value="" disabled selected>¿CUÁNTOS VIENEN?</option>';
            s.innerHTML += '<option value="0">NO PODRÉ ASISTIR</option>';
            for(let i=1; i<=max; i++) s.innerHTML += `<option value="${i}">${i} PILOTOS</option>`;
        }

        function activarBoton() {
            const btn = document.getElementById('btn-confirm');
            btn.disabled = false;
            btn.className = "w-full p-5 rounded-2xl font-black text-white bg-blue-600 shadow-[0_5px_0_#003d80]";
        }

        async function registrarEnSheet() {
            const val = document.getElementById('access-select').value;
            const btn = document.getElementById('btn-confirm');
            btn.disabled = true;
            btn.textContent = "GUARDANDO EN TABLERO...";

            try {
                await fetch(WEB_APP_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    body: JSON.stringify({ nombre: window.invitadoData.nombre, asistencia: val })
                });
                
                document.getElementById('modal-text').textContent = val === "0" ? 
                    "¡Lástima piloto! Te extrañaremos en la pista." : 
                    `¡Excelente! Hemos reservado ${val} lugares para la gran carrera.`;
                
                document.getElementById('modal').classList.remove('hidden');
                if(val !== "0") dispararConfeti();
            } catch(e) {
                btn.disabled = false;
                btn.textContent = "REINTENTAR";
            }
        }

        function dispararConfeti() {
            const container = document.getElementById('confetti-layer');
            const colors = ['#0056b3', '#ff0000', '#facc15', '#ffffff'];
            for (let i = 0; i < 60; i++) {
                const c = document.createElement('div');
                c.className = 'confetti';
                c.style.left = Math.random() * 100 + 'vw';
                c.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                c.style.animationDuration = (Math.random() * 2 + 1) + 's';
                c.style.opacity = Math.random();
                container.appendChild(c);
            }
        }