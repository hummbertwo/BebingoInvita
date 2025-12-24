 const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzHyQRGSKzWQWiDg4nNYlj3wHJ7uoPVm29shpNcSoM2W9pT5FwsWhnrDjW3Yaizs2Vy/exec"; // Mismo que en index.html
        const PASSCODE = "2025"; // Tu clave de admin

        function verificarAcceso() {
            const val = document.getElementById('admin-pass').value;
            if (val === PASSCODE) {
                document.getElementById('login-view').classList.add('hidden');
                document.getElementById('dashboard-view').classList.remove('hidden');
                fetchData();
            } else {
                document.getElementById('error-login').textContent = "CÓDIGO DE ACCESO INCÁLIDO";
            }
        }

        async function fetchData() {
            const body = document.getElementById('table-body');
            const loader = document.getElementById('loader-area');
            const empty = document.getElementById('empty-area');
            
            body.innerHTML = "";
            loader.classList.remove('hidden');
            empty.classList.add('hidden');

            try {
                const response = await fetch(WEB_APP_URL);
                const data = await response.json();
                loader.classList.add('hidden');
                
                if (!data || data.length === 0) {
                    empty.classList.remove('hidden');
                    return;
                }

                let totalGrupos = data.length;
                let totalPersonas = 0;
                let totalNoAsisten = 0;

                data.forEach(inv => {
                    const pasesRaw = inv.asistencia || "0";
                    const numPases = parseInt(pasesRaw);
                    
                    const esInactivo = isNaN(numPases) || numPases === 0 || pasesRaw.toString().toLowerCase().includes("no");

                    if (!esInactivo) {
                        totalPersonas += numPases;
                    } else {
                        totalNoAsisten++;
                    }

                    const row = document.createElement('tr');
                    row.className = "transition-colors"; 
                    row.innerHTML = `
                        <td class="p-4 md:p-6">
                            <div class="flex items-center gap-2 md:gap-3">
                                <div class="flex-shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-full ${esInactivo ? 'bg-slate-100 text-slate-400' : 'bg-blue-100 text-blue-600'} flex items-center justify-center text-[10px] md:text-xs font-bold">
                                    ${inv.nombre.charAt(0)}
                                </div>
                                <span class="font-semibold text-slate-600 text-xs md:text-sm truncate max-w-[120px] sm:max-w-none">${inv.nombre}</span>
                            </div>
                        </td>
                        <td class="p-4 md:p-6 text-right">
                            <span class="inline-flex items-center px-2 py-0.5 md:px-2.5 md:py-1 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-wide whitespace-nowrap ${esInactivo ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}">
                                <span class="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full mr-1 md:mr-1.5 ${esInactivo ? 'bg-rose-600' : 'bg-emerald-600'}"></span>
                                ${esInactivo ? 'No asistirá' : numPases + (numPases === 1 ? ' Pase' : ' Pases')}
                            </span>
                        </td>
                    `;
                    body.appendChild(row);
                });

                document.getElementById('stat-confirm').textContent = totalGrupos;
                document.getElementById('stat-people').textContent = totalPersonas;
                document.getElementById('stat-no').textContent = totalNoAsisten;

            } catch (error) {
                loader.classList.add('hidden');
                empty.classList.remove('hidden');
                empty.textContent = "Error de conexión.";
            }
        }