// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyD482fzV2pvAxozp3rPJyRo4FQIBR-f234",
    authDomain: "cochesperezserrano.firebaseapp.com",
    databaseURL: "https://cochesperezserrano-default-rtdb.europe-west1.firebasedatabase.app/",
    projectId: "cochesperezserrano",
    storageBucket: "cochesperezserrano.appspot.com",
    messagingSenderId: "663329452578",
    appId: "1:663329452578:web:c9fe5cc3fb8285c800d07b"
};

// Inicializa Firebase
const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database();

var personaUid = localStorage.getItem('personaUid');

function obtenerNombreUsuario(uid) {
    const usuariosRef = database.ref('personas/' + uid);
    
    usuariosRef.once('value').then((snapshot) => {
        const usuario = snapshot.val();
        if (usuario) {
            mostrarSaludo(usuario.nombre);
            cargarCoches();
        } else {
            console.error("No se encontró el usuario con el UID proporcionado.");
        }
    }).catch((error) => {
        console.error("Error al obtener el nombre del usuario: ", error);
    });
}

// Verificar si el dispositivo ya tiene un UID almacenado
function verificarUsuario() {
    let personaUid = localStorage.getItem('personaUid');

    if (personaUid) {
        obtenerNombreUsuario(personaUid);  // Mostrar el UID en el saludo directamente
    } else {
        mostrarSeleccionUsuario();
    }
}

// Mostrar saludo personalizado con el UID
function mostrarSaludo(nombre) {
    const saludo = document.getElementById('saludo');
    saludo.textContent = `Hola, ${nombre}`;  // Mostramos el nombre del usuario correctamente
}

// Mostrar una lista de usuarios para seleccionar si es un dispositivo nuevo
function mostrarSeleccionUsuario() {
    const saludo = document.getElementById('saludo');
    saludo.innerHTML = `
        <label for="usuarioSelect">Selecciona quién eres:</label>
        <select id="usuarioSelect"></select>
        <button id="seleccionarUsuarioBtn">Seleccionar</button>
    `;

    const seleccionarUsuarioBtn = document.getElementById('seleccionarUsuarioBtn');
    seleccionarUsuarioBtn.onclick = function() {
        const select = document.getElementById('usuarioSelect');
        const personaSeleccionada = select.value;
        const uidSeleccionado = personaSeleccionada;  // El valor del select es el UID

        localStorage.setItem('personaUid', uidSeleccionado);  // Guardar el UID en localStorage
        obtenerNombreUsuario(uidSeleccionado);  // Mostrar el nombre del usuario
        cargarCoches();  // Cargar los coches después de seleccionar el usuario
    };

    // Cargar los usuarios desde Firebase y llenar el selector
    const usuariosRef = database.ref('personas');
    usuariosRef.once('value').then((snapshot) => {
        const usuarios = snapshot.val();
        const select = document.getElementById('usuarioSelect');
        for (const uid in usuarios) {
            const option = document.createElement('option');
            option.value = uid;
            option.textContent = usuarios[uid].nombre;
            select.appendChild(option);
        }
    }).catch((error) => {
        console.error("Error al cargar los usuarios: ", error);
    });
}

//Cargamos y mostramos los coches desde Firebase
function cargarCoches() {
    const cochesRef = database.ref('coches');
    cochesRef.once('value').then((snapshot) => {
        const coches = snapshot.val();
        const cochesList = document.getElementById('cochesList');
        cochesList.innerHTML = '';  // Limpiar la lista antes de agregar los coches

        for (const id in coches) {
            const coche = coches[id];
            const cocheElement = document.createElement('li');
            const botonReservar = document.createElement('button');
            const botonReservarText = document.createTextNode('Reservar');
            const botonLiberar = document.createElement('button');
            const botonLiberarText = document.createTextNode('Liberar');
            cocheElement.textContent = `${coche.nombre} Disponible: ${coche.disponible ? 'Sí   ' : 'No   '}`;
            
            if (coche.disponible) {
                botonReservar.appendChild(botonReservarText);
                botonReservar.onclick = function() {
                    reservarCoche(id);
                };
                cocheElement.appendChild(botonReservar);
            }else{
                botonLiberar.appendChild(botonLiberarText);
                botonLiberar.onclick = function() {
                    liberarCoche(id);
                };
                cocheElement.appendChild(botonLiberar);
            }

            cochesList.appendChild(cocheElement);
        }
    }).catch((error) => {
        console.error("Error al cargar los coches: ", error);
    });
}

function reservarCoche(id) {
    console.log(id);
    const cochesRef = database.ref('coches/' + id);
    // Actualizamos el coche con el ID proporcionado
    cochesRef.update({ disponible: false });
    cochesRef.update({ reservadoPor: personaUid });
    cargarCoches();
}

function liberarCoche(id) {
    //Comprobamos si el coche está reservado por la persona
    const cocheRef = database.ref('coches/' + id);  
    cocheRef.once('value').then((snapshot) => {
        const coche = snapshot.val();
        if (coche.reservadoPor === personaUid) {
            cocheRef.update({ disponible: true });
            cocheRef.update({ reservadoPor: '' });
        } else {
            alert('No puedes liberar un coche que no has reservado.');
        }
    }).catch((error) => {
        console.error("Error al liberar el coche: ", error);
    });
    cargarCoches();
}

// Llamar a la función para verificar el usuario al cargar la página
document.addEventListener('DOMContentLoaded', verificarUsuario);