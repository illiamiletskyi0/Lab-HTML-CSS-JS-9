import { notes, shows, watchlist } from './state.js';

/** @typedef {import('./state.js').Show} Show */

/**
 * C1. Показує серіали в списку #results — по картці з шаблону #show-card на кожен, у тому
 * самому порядку, — і оновлює рядок статусу #status. Специфікація — ТЗ, C1.
 *
 * @param {readonly Show[]} list серіали, які треба показати
 */
export function renderShows(list) {
  const results = /** @type {HTMLUListElement | null} */ (document.querySelector('#results'));
  const status = /** @type {HTMLElement | null} */ (document.querySelector('#status'));
  const countEl = /** @type {HTMLElement | null} */ (document.querySelector('#watchlist-count'));
  const template = /** @type {HTMLTemplateElement | null} */ (document.querySelector('#show-card'));

  if (countEl) {
    countEl.textContent = String(watchlist.size);
  }

  if (!results || !template) return;

  const fragment = document.createDocumentFragment();
  const cardTemplate = template.content.firstElementChild;

  for (const show of list) {
    if (!cardTemplate) break;
    const card = /** @type {HTMLLIElement} */ (cardTemplate.cloneNode(true));
    card.dataset.id = String(show.id);

    for (const nameEl of card.querySelectorAll('[data-field="name"]')) {
      nameEl.textContent = show.name ?? '—';
    }

    const yearEl = card.querySelector('[data-field="year"]');
    if (yearEl) {
      yearEl.textContent = show.year != null && !Number.isNaN(show.year) ? String(show.year) : '—';
    }

    const genresEl = card.querySelector('[data-field="genres"]');
    if (genresEl) {
      genresEl.textContent = Array.isArray(show.genres) && show.genres.length > 0 ? show.genres.join(', ') : '—';
    }

    const ratingEl = card.querySelector('[data-field="rating"]');
    if (ratingEl) {
      ratingEl.textContent = show.rating != null && !Number.isNaN(show.rating) ? String(show.rating) : '—';
    }

    const toggleBtn = card.querySelector('[data-action="toggle"]');
    if (toggleBtn) {
      toggleBtn.setAttribute('aria-pressed', watchlist.has(show.id) ? 'true' : 'false');
    }

    const myNote = notes.get(show.id);
    const mineBlock = /** @type {HTMLElement | null} */ (card.querySelector('.card__mine'));
    const myRatingEl = card.querySelector('[data-field="my-rating"]');
    const noteEl = /** @type {HTMLElement | null} */ (card.querySelector('[data-field="note"]'));

    if (myNote) {
      if (myRatingEl) {
        myRatingEl.textContent = String(myNote.rating);
      }
      if (mineBlock) {
        mineBlock.hidden = false;
      }
      if (noteEl) {
        if (myNote.text) {
          noteEl.textContent = myNote.text;
          noteEl.hidden = false;
        } else {
          noteEl.textContent = '';
          noteEl.hidden = true;
        }
      }
    } else {
      if (mineBlock) {
        mineBlock.hidden = true;
      }
      if (noteEl) {
        noteEl.textContent = '';
        noteEl.hidden = true;
      }
    }

    fragment.append(card);
  }

  results.replaceChildren(fragment);

  if (status) {
    status.textContent = list.length > 0 ? `Знайдено: ${list.length} з ${shows.length}` : 'Нічого не знайдено';
  }
}
