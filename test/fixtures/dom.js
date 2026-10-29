// HTML mínimo que necesitan la vista y el controlador. Es el mismo que pinta
// main.js, pero no importamos main.js porque también arranca la aplicación.
export const html = `
  <div id="messages"></div>
  <main>
    <div id="list"></div>
    <div id="remove">
      <label for="id-remove">Id del libro:</label>
      <input type="number" id="id-remove">
      <button type="button" id="remove-button">Borrar libro</button>
    </div>
    <div id="form">
      <form id="bookForm">
        <div><input type="number" id="userId" name="userId" required></div>
        <div>
          <select id="moduleCode" name="moduleCode" required>
            <option value="">- Selecciona un módulo -</option>
          </select>
        </div>
        <div><input type="text" id="publisher" name="publisher" required></div>
        <div><input type="number" id="price" name="price" step="0.01" required></div>
        <div><input type="number" id="pages" name="pages" required></div>
        <div>
          <input type="radio" id="status-new" name="status" value="new" required>
          <input type="radio" id="status-good" name="status" value="good">
          <input type="radio" id="status-bad" name="status" value="bad">
        </div>
        <div><input type="url" id="photo" name="photo"></div>
        <div><textarea id="comments" name="comments"></textarea></div>
        <div><input type="date" id="soldDate" name="soldDate"></div>
        <div>
          <button type="submit">Guardar</button>
          <button type="reset">Reset</button>
        </div>
      </form>
    </div>
    <div id="about"><p>Lorem ipsum</p></div>
  </main>
`

export const modulesData = [
  { code: '0373', cliteral: 'Desarrollo web en entorno cliente', vliteral: 'Desenvolupament web en entorn client', courseId: '41' },
  { code: '0485', cliteral: 'Programación', vliteral: 'Programació', courseId: '41' },
]

export const booksData = [
  { id: 1, userId: 7, moduleCode: '0373', publisher: 'Apunts', price: 12, pages: 40, status: 'good', photo: 'foto1.png', comments: 'Muy completos', soldDate: '' },
  { id: 2, userId: 8, moduleCode: '0485', publisher: 'Anaya', price: 28, pages: 180, status: 'new', photo: 'foto2.png', comments: '', soldDate: '2023-12-21' },
]

export const usersData = [
  { id: 7, nick: 'Laura', email: 'laura@x.com', password: 'abcd' },
  { id: 8, nick: 'Carlos', email: 'carlos@x.com', password: 'abcd' },
]

// Rellena el formulario de añadir libro con datos válidos.
export function fillBookForm(form) {
  form.elements.userId.value = '9'
  form.elements.moduleCode.value = '0485'
  form.elements.publisher.value = 'SM'
  form.elements.price.value = '19.5'
  form.elements.pages.value = '120'
  form.querySelector('#status-bad').checked = true
  form.elements.photo.value = 'https://ejemplo.com/foto.png'
  form.elements.comments.value = 'Subrayado a lápiz'
  form.elements.soldDate.value = ''
}
