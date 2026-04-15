// 1. VARIABLES GLOBALES
let workshops = []; 
let map = null; 
let marker = null; 

const container = document.getElementById('workshops-container');
const searchInput = document.getElementById('search-input');

//const searchView = document.getElementById('search-view');
//const detailView = document.getElementById('detail-view');

// 2. FUNCIÓN PARA OBTENER LOS DATOS (FETCH)
/*async function loadWorkshops() {
    try {
        const response = await fetch('data.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        workshops = await response.json(); // Guardamos los datos en la variable global
        
        renderWorkshops(workshops);        // Mostramos los talleres en pantalla

    } catch (error) {
        console.error("Error al cargar el archivo JSON:", error);
        container.innerHTML = '<p>Error al cargar los talleres. Verifica tu conexión o el servidor local.</p>';
    }
}*/
async function loadWorkshops() {
    try {
        const respuesta = await fetch('data.json');
        let talleresBase = await respuesta.json();

        const dataLocal = localStorage.getItem('cc_talleres');
        let talleresLocales = dataLocal && dataLocal !== "[]" ? JSON.parse(dataLocal) : [];

        // Usamos Map para evitar talleres duplicados por ID
        const mapaFusion = new Map();
        talleresBase.forEach(t => mapaFusion.set(t.id, t));
        talleresLocales.forEach(t => mapaFusion.set(t.id, t)); 
    
        workshops = Array.from(mapaFusion.values());
        
        renderWorkshops(workshops); 
    } catch (error) {
        console.error("Error al cargar los talleres:", error);
    }
}

// 3. RENDERIZADO DEL BUSCADOR
function renderWorkshops(data) {
    container.innerHTML = '';
    
    if(data.length === 0) {
        container.innerHTML = '<p>No se encontraron talleres con ese nombre.</p>';
        return;
    }

    data.forEach(workshop => {
        const card = document.createElement('div');
        card.className = 'workshop-card';
        card.onclick = () => showDetailView(workshop);

        const badgeClass = workshop.type === 'propio' ? 'badge-propio' : 'badge-particular';
        const typeText = workshop.type === 'propio' ? 'Centro Cultural' : 'Particular';

        card.innerHTML = `
            <span class="badge ${badgeClass}">${typeText}</span>
            <h3>${workshop.name}</h3>
            <p style="color: #7f8c8d; font-size: 14px; margin-bottom: 10px;">${workshop.category}</p>
            <p>${workshop.description}</p>
        `;
        container.appendChild(card);
    });
}

// Lógica de filtrado
searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = workshops.filter(w => w.name.toLowerCase().includes(term));
    renderWorkshops(filtered);
});

// 4. LÓGICA DE LAS VISTAS
const searchView = document.getElementById('search-view');
const detailView = document.getElementById('detail-view');

function showSearchView() {
    detailView.style.display = 'none';
    searchView.style.display = 'block';
    window.scrollTo(0, 0);
}

function showDetailView(workshop) {
    searchView.style.display = 'none';
    detailView.style.display = 'block';
    window.scrollTo(0, 0);

    document.getElementById('detail-img').src = workshop.image;
    document.getElementById('detail-title').textContent = workshop.name;
    document.getElementById('detail-category').textContent = `Rubro: ${workshop.category}`;
    document.getElementById('detail-description').textContent = workshop.description;
    document.getElementById('detail-phone').textContent = workshop.phone;
    
    const socialEl = document.getElementById('detail-social');
    socialEl.textContent = workshop.social;
    socialEl.href = `https://instagram.com/${workshop.social.replace('@', '')}`;

    const badge = document.getElementById('detail-badge');
    badge.className = 'badge ' + (workshop.type === 'propio' ? 'badge-propio' : 'badge-particular');
    badge.textContent = workshop.type === 'propio' ? 'Propio del Centro Cultural' : 'Taller Particular';

    const activitiesUl = document.getElementById('detail-activities');
    activitiesUl.innerHTML = '';
    workshop.activities.forEach(act => {
        const li = document.createElement('li');
        li.textContent = act;
        activitiesUl.appendChild(li);
    });

    const dynamicInfo = document.getElementById('dynamic-info');
    dynamicInfo.innerHTML = ''; 

    if (workshop.type === 'propio') {
        dynamicInfo.innerHTML = `
            <h4>Ubicación en el Centro Cultural</h4>
            <p>📍 <strong>Módulo:</strong> ${workshop.locationData.modulo} (de 3 módulos)</p>
            <p>🚪 <strong>Aula:</strong> ${workshop.locationData.aula} (de 5 aulas)</p>
        `;
    } else if (workshop.type === 'particular') {
        dynamicInfo.innerHTML = `
            <h4>Ubicación y Horarios</h4>
            <p>📍 <strong>Dirección:</strong> ${workshop.locationData.address}</p>
            <p>🕒 <strong>Horarios de atención:</strong> ${workshop.locationData.hours}</p>
            <div id="map"></div>
        `;
        
        initMap(workshop.locationData.lat, workshop.locationData.lng);
    }
}

// 5. LÓGICA DE LEAFLET MAP
function initMap(lat, lng) {
    setTimeout(() => {
        if (!map) {
            map = L.map('map').setView([lat, lng], 15);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(map);
            marker = L.marker([lat, lng]).addTo(map);
        } else {
            map.setView([lat, lng], 15);
            marker.setLatLng([lat, lng]);
            map.invalidateSize();
        }
    }, 100); 
}

// Iniciar la app
//renderWorkshops(workshops);


// 6. INICIAR LA APLICACIÓN
// En lugar de renderizar directamente, llamamos a la función asíncrona
loadWorkshops();
