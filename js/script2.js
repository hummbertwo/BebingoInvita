const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzTkK5VN8kMME4Eu8opy5KFCECc47eHWS-kjwpEQjMRMKX_6wTQk3INJIgy_KkUiYxA/exec"; 
        const MASTER_PASSWORD = "2025"; 

        let allRows = []; 

        function checkPassword() {
            const input = document.getElementById('admin-password');
            const error = document.getElementById('login-error');
            if (input.value === MASTER_PASSWORD) {
                document.getElementById('login-screen').classList.add('hidden');
                document.getElementById('dashboard-content').classList.remove('hidden');
                fetchData();
            } else {
                error.classList.remove('hidden');
                input.value = "";
            }
        }

        async function fetchData() {
            const body = document.getElementById('table-body');
            const loader = document.getElementById('loader-area');
            
            body.innerHTML = "";
            loader.classList.remove('hidden');

            try {
                const response = await fetch(WEB_APP_URL);
                const rawData = await response.json();
                
                // MAPEO ESTRICTO POR COLUMNAS DE GOOGLE SHEETS
                // A: 0 (Fecha) | B: 1 (Codigo) | C: 2 (Nombre) | D: 3 (Asistencia)
                allRows = rawData.map(item => {
                    const values = Object.values(item); 
                    
                    return {
                        codigo: values[1] || "---",
                        nombre: values[2] || "Sin Nombre",
                        asistencia: (values[3] || "").toString().trim().toUpperCase()
                    };
                });

                loader.classList.add('hidden');
                renderTable(allRows);
                updateStats(allRows);
            } catch (error) {
                console.error("Error:", error);
                loader.innerHTML = "<p class='text-rose-500 text-xs font-bold'>ERROR DE CONEXIÓN</p>";
            }
        }

        function renderTable(data) {
            const body = document.getElementById('table-body');
            body.innerHTML = "";

            data.forEach(row => {
                const tr = document.createElement('tr');
                tr.className = "text-sm hover:bg-slate-50 transition-colors border-b border-slate-50";
                
                // Validación exacta del "SI"
                const isSi = row.asistencia === 'SI';

                tr.innerHTML = `
                    <td class="p-4">
                        <div class="flex flex-col">
                            <span class="text-[10px] text-blue-500 font-black uppercase">CÓDIGO: ${row.codigo}</span>
                            <span class="font-bold text-slate-800 text-base">${row.nombre}</span>
                        </div>
                    </td>
                    <td class="p-4 text-right">
                        <span class="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase border-2 ${isSi ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-200'}">
                            ${isSi ? 'SÍ ASISTE' : 'NO ASISTE'}
                        </span>
                    </td>
                `;
                body.appendChild(tr);
            });
        }

        function updateStats(data) {
            let countYes = 0;
            let countNo = 0;

            data.forEach(row => {
                if (row.asistencia === "SI") countYes++;
                else countNo++;
            });

            document.getElementById('stat-yes').textContent = countYes;
            document.getElementById('stat-no').textContent = countNo;
            document.getElementById('stat-total').textContent = data.length;
        }

        function filterTable() {
            const query = document.getElementById('table-search').value.toLowerCase();
            const filtered = allRows.filter(row => 
                row.nombre.toLowerCase().includes(query) || 
                row.codigo.toString().toLowerCase().includes(query)
            );
            renderTable(filtered);
        }