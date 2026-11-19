// Mensajes de error de cada campo validado, según la propiedad de su objeto
// validity que falla. El orden importa: se muestra el primero que se cumpla.
// customError usa el mensaje que se puso con setCustomValidity.
const ERROR_MESSAGES = {
    moduleCode: {
        valueMissing: 'Debes seleccionar un módulo',
    },
    publisher: {
        valueMissing: 'La editorial es obligatoria',
    },
    price: {
        valueMissing: 'El precio es obligatorio',
        badInput: 'El precio debe ser un número',
        rangeUnderflow: 'El precio no puede ser negativo',
        stepMismatch: 'El precio no puede tener más de 2 decimales',
    },
    pages: {
        valueMissing: 'El número de páginas es obligatorio',
        badInput: 'El número de páginas debe ser un número',
        rangeUnderflow: 'El libro debe tener al menos 1 página',
        stepMismatch: 'El número de páginas debe ser un número entero',
    },
    status: {
        valueMissing: 'Debes indicar el estado del libro',
    },
};
const VALIDATED_FIELDS = Object.keys(ERROR_MESSAGES);

export default class View {
    constructor() {
        this.booksList = document.getElementById('list');
        this.about = document.getElementById('about');
        this.form = document.getElementById('form');
        this.formTitle = document.getElementById('form-title');
        this.bookForm = document.getElementById('bookForm');
        this.idDiv = document.getElementById('id-div');
        this.idInput = document.getElementById('id');
        this.moduleSelect = document.getElementById('moduleCode');
        this.messages = document.getElementById('messages');
        this.pages = [this.booksList, this.form, this.about];

        // Validamos nosotros (con nuestros mensajes), no el navegador
        this.bookForm.noValidate = true;

        // Al resetear (con el botón o desde código) el formulario vuelve a ser de "Añadir"
        // y no debe quedar ningún error del libro anterior
        this.bookForm.addEventListener('reset', () => {
            this.clearFormErrors();
            this.setAddMode();
        });

        // Al cambiar de módulo el error de "módulo repetido" ya no es válido: lo
        // quitamos y, si hay que ponerlo otra vez, lo dirá el controlador.
        // Se registra aquí para que se ejecute antes del handler de bindModuleChange.
        this.moduleSelect.addEventListener('change', () => this.moduleSelect.setCustomValidity(''));

        // Si un campo ya muestra un error, lo actualizamos mientras el usuario lo corrige
        ['input', 'change'].forEach(type => this.bookForm.addEventListener(type, event => {
            const name = event.target.name;
            if (VALIDATED_FIELDS.includes(name) && this.getErrorElement(name).textContent) {
                this.validateField(name);
            }
        }));
    }

    showPage(pageId) {
        this.pages.forEach(page => page.classList.toggle('hidden', page.id !== pageId));
    }

    renderModulesSelect(modules) {
        modules.forEach(module => {
            const option = document.createElement('option');
            option.value = module.code;
            option.textContent = module.cliteral;
            this.moduleSelect.appendChild(option);
        });
    }

    renderBooksList(books, modules = []) {
        this.booksList.innerHTML = '';
        books.forEach(book => this.renderBook(book, modules.find(module => module.code === book.moduleCode)));
    }

    createBookCard(book, module) {
        const moduleName = module ? module.cliteral : book.moduleCode;
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.id = book.id;
        card.dataset.module = moduleName;
        card.innerHTML = `
            <div class="card-img">
                <img src="${book.photos}" alt="Libro: ${book.id}">
            </div>
            <div class="card-body">
                <h3>${moduleName} (${book.id})</h3>
                <h4>${book.publisher}</h4>
                <p>${book.pages} páginas</p>
                <p>Estado: ${book.status}</p>
                <p>${book.soldDate ? 'Vendido el ' + new Date(book.soldDate).toLocaleDateString('es-ES') : 'En venta'}</p>
                <p>${book.comments}</p>
                <h4>${book.price} €</h4>
            </div>
            <div class="card-actions">
                <button type="button" data-action="cart" title="Añadir al carrito">
                    <span class="material-icons">add_shopping_cart</span>
                </button>
                <button type="button" data-action="edit" title="Editar libro">
                    <span class="material-icons">edit</span>
                </button>
                <button type="button" data-action="delete" title="Eliminar libro">
                    <span class="material-icons">delete</span>
                </button>
            </div>`;
        return card;
    }

    renderBook(book, module) {
        const card = this.createBookCard(book, module);
        this.booksList.appendChild(card);
        return card;
    }

    renderUpdatedBook(book, module) {
        const oldCard = this.booksList.querySelector(`.card[data-id="${book.id}"]`);
        const card = this.createBookCard(book, module);
        oldCard.replaceWith(card);
        return card;
    }

    removeBook(bookId) {
        const card = this.booksList.querySelector(`.card[data-id="${bookId}"]`);
        if (card) {
            card.remove();
        }
    }

    renderEditForm(book) {
        const fields = this.bookForm.elements;
        this.clearFormErrors();
        this.formTitle.textContent = 'Editar libro';
        this.idDiv.classList.remove('hidden');
        this.idInput.value = book.id;
        fields.moduleCode.value = book.moduleCode;
        fields.publisher.value = book.publisher;
        fields.price.value = book.price;
        fields.pages.value = book.pages;
        const status = this.bookForm.querySelector(`input[name="status"][value="${book.status}"]`);
        if (status) {
            status.checked = true;
        }
        fields.photo.value = book.photos;
        fields.comments.value = book.comments;
        fields.soldDate.value = book.soldDate;
    }

    setAddMode() {
        this.formTitle.textContent = 'Añadir libro';
        this.idDiv.classList.add('hidden');
        this.idInput.value = '';
    }

    getBookFormValues() {
        const data = new FormData(this.bookForm);
        return {
            id: this.idInput.value,
            moduleCode: data.get('moduleCode'),
            publisher: data.get('publisher'),
            price: Number(data.get('price')),
            pages: Number(data.get('pages')),
            status: data.get('status'),
            photo: data.get('photo'),
            comments: data.get('comments'),
            soldDate: data.get('soldDate'),
        };
    }

    resetForm() {
        this.bookForm.reset();
    }

    bindSubmitBook(handler) {
        this.bookForm.addEventListener('submit', event => {
            event.preventDefault();
            // Al controlador sólo le llegan datos correctos
            if (this.validateForm()) {
                handler(this.getBookFormValues());
            }
        });
    }

    // Avisa al controlador del módulo elegido (y de qué libro se edita, '' si se añade)
    // para que compruebe si el usuario ya tiene un libro de ese módulo.
    bindModuleChange(handler) {
        this.moduleSelect.addEventListener('change', () => {
            if (this.moduleSelect.value) {
                handler(this.moduleSelect.value, this.idInput.value);
            }
        });
    }

    // --- Validación del formulario ---

    getErrorElement(name) {
        return document.getElementById(`${name}-error`);
    }

    // Devuelve el elemento del formulario que tiene el estado de validez del campo.
    // En los radio todos los del grupo comparten validez, así que vale el primero.
    getField(name) {
        const field = this.bookForm.elements[name];
        return field instanceof RadioNodeList ? field[0] : field;
    }

    getErrorMessage(name) {
        const field = this.getField(name);
        const { validity } = field;
        if (validity.valid) {
            return '';
        }
        const messages = ERROR_MESSAGES[name];
        const failing = Object.keys(messages).find(key => validity[key]);
        if (failing) {
            return messages[failing];
        }
        if (validity.customError) {
            return field.validationMessage;
        }
        return 'Valor no válido';
    }

    showFieldError(name, message) {
        this.getErrorElement(name).textContent = message;
        const elements = this.bookForm.elements[name];
        const fields = elements instanceof RadioNodeList ? [...elements] : [elements];
        fields.forEach(field => field.setAttribute('aria-invalid', message ? 'true' : 'false'));
    }

    // Valida un campo, muestra su error (o lo borra) y devuelve si es válido
    validateField(name) {
        const message = this.getErrorMessage(name);
        this.showFieldError(name, message);
        return message === '';
    }

    // Valida todos los campos (no se para en el primero, para mostrar todos los errores)
    validateForm() {
        return VALIDATED_FIELDS.map(name => this.validateField(name)).every(valid => valid);
    }

    clearFormErrors() {
        this.moduleSelect.setCustomValidity('');
        VALIDATED_FIELDS.forEach(name => this.showFieldError(name, ''));
    }

    // La respuesta del servidor llega un rato después de cambiar el módulo. Si
    // mientras tanto el usuario ha elegido otro módulo, ha reseteado o se ha ido
    // a editar otro libro, la respuesta ya no corresponde a este formulario.
    isCurrentModule(moduleCode, bookId) {
        return this.moduleSelect.value === moduleCode && this.idInput.value === bookId;
    }

    // El controlador nos dice que el módulo no es válido (está repetido)
    setModuleError(moduleCode, bookId, message) {
        if (!this.isCurrentModule(moduleCode, bookId)) {
            return;
        }
        this.moduleSelect.setCustomValidity(message);
        this.validateField('moduleCode');
    }

    // El controlador nos dice que el módulo es válido
    clearModuleError(moduleCode, bookId) {
        if (!this.isCurrentModule(moduleCode, bookId)) {
            return;
        }
        this.moduleSelect.setCustomValidity('');
        this.validateField('moduleCode');
    }

    // Los botones de las tarjetas se crean y destruyen dinámicamente, así que
    // ponemos un único escuchador en la lista (delegación de eventos).
    onCardAction(action, handler) {
        this.booksList.addEventListener('click', event => {
            const button = event.target.closest(`button[data-action="${action}"]`);
            if (!button) {
                return;
            }
            const card = button.closest('.card');
            handler(card.dataset.id, card);
        });
    }

    bindAddToCart(handler) {
        this.onCardAction('cart', bookId => handler(bookId));
    }

    bindEditBook(handler) {
        this.onCardAction('edit', bookId => handler(bookId));
    }

    bindRemoveBook(handler) {
        this.onCardAction('delete', (bookId, card) => {
            if (window.confirm(`¿Seguro que quieres borrar el libro ${bookId} (${card.dataset.module})?`)) {
                handler(bookId);
            }
        });
    }

    showMessage(type, message) {
        const div = document.createElement('div');
        div.className = `${type} alert alert-${type} alert-dismissible`;
        div.setAttribute('role', 'alert');
        div.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close" onclick="this.parentElement.remove()">x</button>`;
        div.querySelector('.btn-close').addEventListener('click', () => div.remove());
        this.messages.appendChild(div);

        if (type !== 'error') {
            setTimeout(() => div.remove(), 3000);
        }
    }
}
