/** @typedef {import('./state.js').Filters} Filters */

/**
 * C3. Повертає поточні значення форми фільтрів #filters.
 * Специфікація — ТЗ, C3.
 *
 * @returns {Filters}
 */
export function readFilters() {
  const form = /** @type {HTMLFormElement | null} */ (document.querySelector('#filters'));
  if (!form) {
    return { query: '', genre: '', mine: false };
  }

  const queryInput = /** @type {HTMLInputElement | null} */ (form.elements.namedItem('query'));
  const genreSelect = /** @type {HTMLSelectElement | null} */ (form.elements.namedItem('genre'));
  const mineCheckbox = /** @type {HTMLInputElement | null} */ (form.elements.namedItem('mine'));

  return {
    query: (queryInput?.value ?? '').trim().toLowerCase(),
    genre: genreSelect?.value ?? '',
    mine: Boolean(mineCheckbox?.checked),
  };
}

/**
 * C3. Підключає форму фільтрів: після кожної зміни — refresh(). main.js викликає цю функцію
 * один раз. Специфікація — ТЗ, C3.
 *
 * @param {() => void} refresh перемальовує список для поточних фільтрів
 */
export function initFilters(refresh) {
  const form = /** @type {HTMLFormElement | null} */ (document.querySelector('#filters'));
  if (!form) return;

  const queryInput = /** @type {HTMLInputElement | null} */ (form.elements.namedItem('query'));
  const genreSelect = /** @type {HTMLSelectElement | null} */ (form.elements.namedItem('genre'));
  const mineCheckbox = /** @type {HTMLInputElement | null} */ (form.elements.namedItem('mine'));

  if (queryInput) {
    queryInput.addEventListener('input', () => {
      refresh();
    });
  }

  if (genreSelect) {
    genreSelect.addEventListener('change', () => {
      refresh();
    });
  }

  if (mineCheckbox) {
    mineCheckbox.addEventListener('change', () => {
      refresh();
    });
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    refresh();
  });

  form.addEventListener('reset', (event) => {
    event.preventDefault();
    if (queryInput) queryInput.value = '';
    if (genreSelect) genreSelect.value = '';
    if (mineCheckbox) mineCheckbox.checked = false;
    refresh();
  });
}
