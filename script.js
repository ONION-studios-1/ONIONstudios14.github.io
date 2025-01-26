const pdfjsLib = window['pdfjs-dist/build/pdf'];

// Configuración del archivo worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdf.worker.js';

// Variables globales
let pdfDoc = null; // Documento PDF cargado
let scale = 1.5; // Escala inicial del PDF
const minScale = 0.5; // Escala mínima
const maxScale = 3.0; // Escala máxima

// Función para renderizar todas las páginas
async function renderPages() {
    const container = document.getElementById('pdfViewerContainer');
    container.innerHTML = ''; // Limpia el contenedor

    for (let pageNumber = 1; pageNumber <= pdfDoc.numPages; pageNumber++) {
        const page = await pdfDoc.getPage(pageNumber);
        const viewport = page.getViewport({ scale });

        // Crear un contenedor para cada página
        const pageContainer = document.createElement('div');
        pageContainer.className = 'page-container';
        pageContainer.style.width = `${viewport.width}px`;
        pageContainer.style.height = `${viewport.height}px`;

        // Crear un canvas para cada página
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const context = canvas.getContext('2d');

        // Renderizar la página en el canvas
        await page.render({ canvasContext: context, viewport }).promise;

        // Añadir el canvas al contenedor de la página
        pageContainer.appendChild(canvas);
        container.appendChild(pageContainer);
    }
}

// Función para cargar un PDF completo
async function loadPDF(fileName, youtubeURL, element) {
    try {
        // Cargar el documento PDF
        pdfDoc = await pdfjsLib.getDocument(fileName).promise;

        // Renderizar todas las páginas
        await renderPages();

        // Actualizar el enlace de YouTube
        const youtubeLinkContainer = document.getElementById('youtubeLink');
        youtubeLinkContainer.innerHTML = `Ver video relacionado: <a href="${youtubeURL}" target="_blank">YouTube</a>`;

        // Cambiar la clase activa en la barra lateral
        const items = document.querySelectorAll('.sidebar-item');
        items.forEach(item => item.classList.remove('active'));
        element.classList.add('active');
    } catch (error) {
        console.error('Error al cargar el PDF:', error);
        alert('No se pudo cargar el PDF.');
    }
}

// Función para manejar el zoom
function handleZoom(event) {
    const zoomFactor = 0.1; // Incremento del zoom
    if (event.deltaY < 0 && scale < maxScale) {
        scale += zoomFactor;
    } else if (event.deltaY > 0 && scale > minScale) {
        scale -= zoomFactor;
    }
    renderPages(); // Re-renderizar todas las páginas con la nueva escala
}

// Agregar eventos para el zoom
const pdfViewerContainer = document.getElementById('pdfViewerContainer');
pdfViewerContainer.addEventListener('wheel', (event) => {
    if (event.ctrlKey) {
        event.preventDefault(); // Evitar el scroll por defecto
        handleZoom(event); // Realizar el zoom
    }
});

