// Enrutador simple: muestra sólo la "página" indicada en el hash de la URL.
// La ruta #edit muestra el formulario sin vaciarlo (se está editando un libro).
const PAGES = ['list', 'form', 'about'];
const DEFAULT_PAGE = 'list';

export default class Router {
    constructor(view) {
        this.view = view;
    }

    init() {
        window.addEventListener('hashchange', () => this.navigate());
        this.navigate();
    }

    navigate() {
        const route = window.location.hash.slice(1);

        if (route === 'edit') {
            this.view.showPage('form');
            return;
        }

        const page = PAGES.includes(route) ? route : DEFAULT_PAGE;
        if (page === 'form') {
            this.view.resetForm();
        }
        this.view.showPage(page);
    }
}
