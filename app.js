/* global auth0 */
let client = null;
const listaCarrito = document.getElementById('lista-carrito');
const totalPrecio = document.getElementById('total-precio');
const btnLogin = document.getElementById('btn-login');
const btnLogout = document.getElementById('btn-logout');
const welcomeMsg = document.getElementById('welcome-msg');
const userInfo = document.getElementById('user-info');

// Estado global del carrito (Carga desde Session Storage)
let carrito = JSON.parse(sessionStorage.getItem('carrito')) || [];

// 2. INICIALIZACIÓN DE AUTH0 (Requisito: Programación Segura)
const initializeAuth0 = async () => {
    try {
        window.client = await auth0.createAuth0Client({
            domain: 'dev-kvc5cesmo6mdyb6c.us.auth0.com',
            clientId: 'F9JItvC8z3ibOPrOJjlCyxO2SNeFpOXR',
            authorizationParams: {
                // Usa la URL actual dinámicamente para evitar errores de Callback
                redirect_uri: window.location.href 
            }
        });

        // Manejo del Callback tras el Login
        if (location.search.includes("code=") && location.search.includes("state=")) {
            await window.client.handleRedirectCallback();
            window.history.replaceState({}, document.title, window.location.pathname);
        }

        const isAuthenticated = await window.client.isAuthenticated();

        if (isAuthenticated) {
            const user = await window.client.getUser();
            // Requisito: Mensaje de bienvenida con nombre o email
            welcomeMsg.textContent = `Bienvenido, ${user.name || user.email}`;
            userInfo.style.display = "inline-block";
            btnLogin.style.display = "none";
        } else {
            userInfo.style.display = "none";
            btnLogin.style.display = "inline-block";
        }
    } catch (error) {
        console.error("Error inicializando Auth0:", error);
    }
};

// 3. GESTIÓN DEL CARRITO
function agregarAlCarrito(nombre, precio) {
    carrito.push({ nombre: nombre, precio: precio });
    sessionStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarVista();
}

function actualizarVista() {
    listaCarrito.innerHTML = '';
    let total = 0;

    if (carrito.length === 0) {
        listaCarrito.innerHTML = '<li style="color: gray;">Tu carrito está vacío</li>';
    }

    carrito.forEach((item) => {
        const li = document.createElement('li');
        li.textContent = `${item.nombre} - $${item.precio.toLocaleString('es-CL')}`;
        listaCarrito.appendChild(li);
        total += item.precio;
    });

    totalPrecio.innerText = total.toLocaleString('es-CL');
}

// 4. FLUJO DE NAVEGACIÓN Y PAGO (Requisito: Interfaz Intuitiva)

const btnFinalizarCarrito = document.getElementById('btn-finalizar');
if (btnFinalizarCarrito) {
    btnFinalizarCarrito.onclick = () => {
        if (carrito.length === 0) {
            alert("Tu carrito está vacío. Agrega productos antes de continuar.");
            return;
        }
        // Baja suavemente hasta la sección de pago
        document.getElementById('pago-simulado').scrollIntoView({ behavior: 'smooth' });
    };
}

// Botón del Formulario: El que realmente procesa y valida
const btnPagarFormulario = document.getElementById('btn-pagar');
if (btnPagarFormulario) {
    btnPagarFormulario.onclick = () => {
        const nombre = document.getElementById('nombre-completo').value;
        const email = document.getElementById('email').value;
        const telefono = document.getElementById('telefono').value;

        // Validaciones de Seguridad (Requisito Semana 6)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert("Error: Ingrese un correo electrónico válido.");
            return;
        }

        const telRegex = /^[0-9]{8,11}$/;
        if (!telRegex.test(telefono)) {
            alert("Error: El teléfono debe tener solo números (8-11 dígitos).");
            return;
        }

        if (nombre.trim() === "" || carrito.length === 0) {
            alert("Por favor, completa tus datos y asegúrate de tener productos en el carro.");
            return;
        }

        // Éxito de Compra
        alert(`¡Gracias por tu compra en SportyStyle, ${nombre}!\nTotal: $${totalPrecio.innerText}\nPronto recibirás un correo en ${email}.`);
        
        // REQUISITO: Limpieza de datos tras finalizar
        carrito = [];
        sessionStorage.clear(); 
        actualizarVista();
        
        // Opcional: Subir al inicio tras comprar
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
}

// 5. EVENTOS DE AUTENTICACIÓN
btnLogin.onclick = async () => {
    await window.client.loginWithRedirect();
};

btnLogout.onclick = async () => {
    // Requisito: Limpiar sesión local al salir
    sessionStorage.clear();
    await window.client.logout({
        logoutParams: { 
            // Debe coincidir con lo que configuraste en el Dashboard de Auth0
            returnTo: window.location.origin + window.location.pathname 
        }
    });
};

// 6. CARGA INICIAL
window.onload = async () => {
    await initializeAuth0();
    actualizarVista();
};