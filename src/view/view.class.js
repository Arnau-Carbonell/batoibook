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

        // Al resetear (con el botón o desde código) el formulario vuelve a ser de "Añadir"
        this.bookForm.addEventListener('reset', () => this.setAddMode());
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
            handler(this.getBookFormValues());
        });
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
