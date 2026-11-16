let preguntas = [];
let preguntaActual = 0;
let puntuacion = 0;
let seleccionada = null;
let corregida = false;
let tituloCuestionario = "";
let historial = [];

// MENÚ

function seleccionarQuiz(nombre) {
    localStorage.setItem("quiz", nombre);
    location.href = "quiz.html";
}

// QUIZ

document.addEventListener("DOMContentLoaded", () => {

    if (document.getElementById("pregunta")) {
        iniciarQuiz();
    }

});

async function iniciarQuiz() {

    const quiz = localStorage.getItem("quiz");

    const respuesta =
        await fetch(`${quiz}.json`);

    const datos = await respuesta.json();

    tituloCuestionario = datos.titulo;

    document.getElementById("tituloCuestionario").textContent =
        datos.titulo;

    preguntas = datos.preguntas
        .sort(() => Math.random() - 0.5)
        .slice(0, 10);

    mostrarPregunta();

    document
        .getElementById("btnAccion")
        .addEventListener("click", accionBoton);
}

function mostrarPregunta() {

    seleccionada = null;
    corregida = false;

    const pregunta = preguntas[preguntaActual];

    document.getElementById("pregunta").textContent =
        pregunta.pregunta;

    const imagen =
        document.getElementById("imagenPregunta");

    if (pregunta.imagen) {

        imagen.src = pregunta.imagen;
        imagen.style.display = "block";

    } else {

        imagen.style.display = "none";
        imagen.src = "";
    }

    const contenedor =
        document.getElementById("respuestas");

    contenedor.innerHTML = "";

    pregunta.opciones.forEach((texto, indice) => {

        const boton =
            document.createElement("button");

        boton.textContent = texto;

        boton.addEventListener("click", () => {

            document
                .querySelectorAll("#respuestas button")
                .forEach(b => b.style.border = "");

            boton.style.border =
                "3px solid blue";

            seleccionada = indice;
        });

        contenedor.appendChild(boton);
    });

    document.getElementById("btnAccion").textContent =
        "Confirmar";
}

function accionBoton() {

    if (!corregida) {
        corregir();
    } else {
        siguientePregunta();
    }
}

function corregir() {

    if (seleccionada === null) {
        alert("Selecciona una respuesta");
        return;
    }

    const correcta =
        preguntas[preguntaActual].correcta;

    const pregunta =
        preguntas[preguntaActual];

    historial.push({

        pregunta: pregunta.pregunta,

        acertada:
            seleccionada === correcta,

        respuestaCorrecta:
            pregunta.opciones[correcta]

    });

    const botones =
        document.querySelectorAll("#respuestas button");

    botones[correcta].style.backgroundColor = "green";
    botones[correcta].style.color = "white";

    const textoCorrecto =
        document.createElement("div");

    textoCorrecto.classList.add(
        "mensaje-correccion",
        "correcto"
    );

    textoCorrecto.textContent = "Correcto";

    botones[correcta]
        .insertAdjacentElement(
            "afterend",
            textoCorrecto
        );

    if (seleccionada !== correcta) {

        botones[seleccionada].style.backgroundColor = "red";
        botones[seleccionada].style.color = "white";

        const textoIncorrecto =
            document.createElement("div");

        textoIncorrecto.classList.add(
            "mensaje-correccion",
            "incorrecto"
        );

        textoIncorrecto.textContent =
            "Incorrecto";

        botones[seleccionada]
            .insertAdjacentElement(
                "afterend",
                textoIncorrecto
            );

    } else {

        puntuacion++;
    }

    corregida = true;

    document.getElementById("btnAccion").textContent =
        "Siguiente pregunta";
}

function siguientePregunta() {

    preguntaActual++;

    if (preguntaActual < preguntas.length) {

        mostrarPregunta();

    } else {

        mostrarResultado();
    }
}

function mostrarResultado() {

    let historialHTML = `
        <ul class="historial">
    `;

    historial.forEach(item => {

        if (item.acertada) {

            historialHTML += `
                <li class="acierto">
                    ✅ ${item.pregunta}
                </li>
            `;
        }
        else {

            historialHTML += `
                <li class="fallo">
                    ❌ ${item.pregunta}
                    <br>
                    <strong>Respuesta correcta:</strong>
                    ${item.respuestaCorrecta}
                </li>
            `;
        }

    });

    historialHTML += `
        </ul>
    `;

    document.body.innerHTML = `
        <h1>Resultado final</h1>

        <h2 class="resultado">
            Has obtenido ${puntuacion}/${preguntas.length}
        </h2>

        ${historialHTML}

        <nav id="navQuiz">
            <button onclick="mostrarRanking()">
                Ver rankings
            </button>

            <button class="back2menu" onclick="volverMenu()">
                Volver al menú
            </button>
        </nav>
    `;
}

function guardarPuntuacion() {

    const nombre = prompt("Introduce tu nombre");

    if (!nombre) return;

    const ranking =
        JSON.parse(localStorage.getItem("ranking")) || [];

    ranking.unshift({
        nombre: nombre,
        cuestionario: tituloCuestionario,
        nota: puntuacion,
        total: preguntas.length,
        fecha: new Date().toLocaleDateString("es-ES")
    });

    localStorage.setItem(
        "ranking",
        JSON.stringify(ranking)
    );

    mostrarRanking();
}

function mostrarRanking() {

    const ranking =
        JSON.parse(localStorage.getItem("ranking")) || [];

    let html = "";

    if (ranking.length === 0) {

        html += `
            <h1>Rankings</h1>

            <p class="no-puntuaciones">No hay puntuaciones guardadas.</p>
        `;

    } else {

        html = `
            <div class="ranking-container">

                <h1>Rankings</h1>

                <ul>
        `;

        ranking.forEach(score => {

            html += `
                <li>
                    ${score.nombre}
                    -
                    ${score.cuestionario}:
                    ${score.nota}/${score.total}
                    (${score.fecha})
                </li>
            `;
        });

    }

    html += `
        <nav id="navQuiz">
            <button onclick="guardarPuntuacion()">
                Guardar score
            </button>
    `;

    if (ranking.length > 0) {

        html += `
            <button onclick="borrarRanking()">
                Borrar rankings
            </button>
        `;
    }

    html += `
            <button class="back2menu" onclick="volverMenu()">
                Volver al menú
            </button>
        </nav>
    `;

    document.body.innerHTML = html;
}

function borrarRanking() {

    if (confirm("¿Seguro que quieres borrar todos los rankings?")) {

        localStorage.removeItem("ranking");

        mostrarRanking();
    }
}

function volverMenu() {

    localStorage.removeItem("quiz");

    location.href = "index.html";
}

function volverMenuConfirmacion() {

    const salir = confirm(
        "Si vuelves al menú perderás todo el progreso actual. ¿Deseas continuar?"
    );

    if (salir) {

        location.href = "index.html";

    }
}