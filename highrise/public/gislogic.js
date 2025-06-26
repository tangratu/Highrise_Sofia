
const map = L.map('map'); 
const statusBar = document.getElementById('status-bar');


const mapProviders = {
    osm: {
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }
}

let currentBaseLayer; 

function changeBaseMap(providerKey) {
    if (currentBaseLayer) {
        map.removeLayer(currentBaseLayer); 
    }
    const provider = mapProviders[providerKey];
    currentBaseLayer = L.tileLayer(provider.url, { attribution: provider.attribution }).addTo(map); 
}


changeBaseMap('osm');




const normImg = new Image(); normImg.src = 'normal.png';
const hoveImg = new Image(); hoveImg.src = 'hover.png';

normImg.onload = hoveImg.onload = function () {
    const hoverRatio = hoveImg.naturalHeight / hoveImg.naturalWidth;
    window.normalIcon = L.icon({ 
        iconUrl: 'normal.png', 
        iconSize: [16, 16 * hoverRatio ], iconAnchor: [8, 16 * hoverRatio] });
    window.hoverIcon = L.icon({ 
        iconUrl: 'hover.png', 
        iconSize: [32, 32 * hoverRatio], iconAnchor: [16, 32 * hoverRatio] });
};







const fetchData = async () => {
    try {
        const response = await fetch('/api/highrise');
        const geojsonData = await response.json();

       
        const geoJsonLayer = L.geoJSON(geojsonData, {
            pointToLayer: (feature, latlng) => {
                const marker = L.marker(latlng, { icon: normalIcon }); 
                marker.on({ 
                    mouseover: async (e) => {
                        marker.setIcon(hoverIcon);
						 try {
								const url = `/api/adress?lat=${latlng.lat}&lon=${latlng.lng}`;
								const resp = await fetch(url);

								if (!resp.ok) {
									const errData = await resp.json();
									throw new Error(`Proxy error: ${resp.status} - ${errData.error || resp.statusText}`);
								}

								const rgeocode = await resp.json();
								
								statusBar.textContent = ` ${rgeocode.features[0].properties.formatted}`;
        
								

						} catch (error) {
							console.error(`Error fetching or displaying  adress:`, error);
							statusBar.textContent = `Грешка при зареждане на адрес`;
						}

                        
                        
                    },
                    mouseout: () => {
                        marker.setIcon(normalIcon);
                        statusBar.textContent = `посочи за адрес`;
                    },
                    
                });
                return marker;
            }
            
        }).addTo(map);

        
        map.fitBounds(geoJsonLayer.getBounds()); 

        map.on('click', async (e) => { 
            statusBar.textContent = 'Click on a buildsite to see details';
        });

    } catch (error) {
        console.error('Грешка при зареждане на GeoJSON данните:', error);
        statusBar.textContent = 'Грешка при зареждане на данните';
        alert('Неуспешно зареждане на GeoJSON данните. Вижте конзолата за подробности.');
    }
};

// Зареждане на данните при готовност на страницата
fetchData();
