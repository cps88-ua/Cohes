// Obtener coches desde Firebase y mostrar en la lista
function obtenerCoches() {
    const cochesRef = database.ref('coches');
    cochesRef.on('value', (snapshot) => {
        const coches = snapshot.val();
        const listaCoches = document.getElementById('listaCoches');
        listaCoches.innerHTML = ''; // Limpiar la lista

        for (const id in coches) {
            const coche = coches[id];
            const li = document.createElement('li');
            li.textContent = `${coche.marca} ${coche.modelo} - ${coche.disponible ? 'Disponible' : `Ocupado por ${coche.usuarioID}`}`;
            li.setAttribute('data-id', id); // Guarda el ID en el elemento
            listaCoches.appendChild(li);
        }
    });
}

// Reservar coche
async function reservarCocheSeleccionado() {
    const coches = document.querySelectorAll('#listaCoches li');
    coches.forEach((coche) => {
        if (coche.textContent.includes('Disponible')) {
            const id = coche.getAttribute('data-id');
            reservarCoche(id);
            return; // Solo reservar el primer coche disponible
        }
    });
}

// Función para reservar un coche
async function reservarCoche(id) {
    const cocheRef = database.ref(`coches/${id}`);
    cocheRef.once('value', (snapshot) => {
        const coche = snapshot.val();
        if (coche && coche.disponible) {
            cocheRef.update({
                disponible: false,
                usuarioID: dispositivoID // Asignar el ID del dispositivo
            });
            alert('Coche reservado');
        } else {
            alert('Coche no disponible');
        }
    });
}

// Liberar coche
async function liberarCocheSeleccionado() {
    const coches = document.querySelectorAll('#listaCoches li');
    coches.forEach((coche) => {
        if (coche.textContent.includes(`Ocupado por ${dispositivoID}`)) {
            const id = coche.getAttribute('data-id');
            liberarCoche(id);
            return; // Solo liberar el primer coche ocupado por este dispositivo
        }
    });
}

// Función para liberar un coche
async function liberarCoche(id) {
    const cocheRef = database.ref(`coches/${id}`);
    cocheRef.once('value', (snapshot) => {
        const coche = snapshot.val();
        if (coche && coche.usuarioID === dispositivoID) {
            cocheRef.update({
                disponible: true,
                usuarioID: null // Limpiar el ID del usuario
            });
            alert('Coche liberado');
        } else {
            alert('No puedes liberar este coche');
        }
    });
}

// Inicializar
obtenerCoches();
