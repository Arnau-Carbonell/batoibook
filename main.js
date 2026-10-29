import './src/style.css'
import Controller from './src/controller/controller.class.js'

document.querySelector('#app').innerHTML = `
  <header>
    <img src="/logoBatoi.png" alt="Logo Batoi">
    <h1>BatoiBooks</h1>
  </header>

  <nav>
    <ul>
      <li><a href="#list">Ver Libros</a></li>
      <li><a href="#form">Añadir Libro</a></li>
      <li><a href="#about">Acerca de...</a></li>
    </ul>
  </nav>

  <div id="messages"></div>

  <main>
    <div id="list"></div>

    <div id="remove">
      <label for="id-remove">Id del libro:</label>
      <input type="number" id="id-remove" min="1" required>
      <button type="button" id="remove-button">Borrar libro</button>
    </div>

    <div id="form">
      <form id="bookForm">
        <div>
          <label for="userId">Usuario:</label>
          <input type="number" id="userId" name="userId" min="1" required>
        </div>
        <div>
          <label for="moduleCode">Módulo:</label>
          <select id="moduleCode" name="moduleCode" required>
            <option value="">- Selecciona un módulo -</option>
          </select>
        </div>
        <div>
          <label for="publisher">Editorial:</label>
          <input type="text" id="publisher" name="publisher" required>
        </div>
        <div>
          <label for="price">Precio:</label>
          <input type="number" id="price" name="price" min="0" step="0.01" required>
        </div>
        <div>
          <label for="pages">Páginas:</label>
          <input type="number" id="pages" name="pages" min="1" required>
        </div>
        <div>
          <span>Estado:</span>
          <input type="radio" id="status-new" name="status" value="new" required>
          <label for="status-new">Nuevo</label>
          <input type="radio" id="status-good" name="status" value="good">
          <label for="status-good">Bueno</label>
          <input type="radio" id="status-bad" name="status" value="bad">
          <label for="status-bad">Malo</label>
        </div>
        <div>
          <label for="photo">Foto (URL):</label>
          <input type="url" id="photo" name="photo">
        </div>
        <div>
          <label for="comments">Comentarios:</label>
          <textarea id="comments" name="comments" maxlength="500"></textarea>
        </div>
        <div>
          <label for="soldDate">Fecha de venta:</label>
          <input type="date" id="soldDate" name="soldDate">
        </div>
        <div>
          <button type="submit">Guardar</button>
          <button type="reset">Reset</button>
        </div>
      </form>
    </div>

    <div id="about">
      <h2>Acerca de...</h2>
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
    </div>
  </main>

  <footer>
    <p>Arnau Carbonell</p>
  </footer>
`

document.addEventListener('DOMContentLoaded', () => {
  const myController = new Controller()
  myController.init()
})
