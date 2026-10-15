import { openDetails } from './details.js';
import { toggle, watchlist } from './state.js';

/**
 * C2. Підключає кнопки карток у списку #results: «До списку» додає серіал до мого списку або
 * прибирає з нього, «Детальніше» відкриває діалог (openDetails з details.js). main.js викликає
 * цю функцію один раз, після першого показу списку. Специфікація — ТЗ, C2.
 *
 * @param {() => void} refresh перемальовує список для поточних фільтрів
 */
export function initList(refresh) {
  const results = /** @type {HTMLUListElement | null} */ (document.querySelector('#results'));
  const countEl = /** @type {HTMLElement | null} */ (document.querySelector('#watchlist-count'));

  if (countEl) {
    countEl.textContent = String(watchlist.size);
  }

  if (!results) return;

  results.addEventListener('click', (event) => {
    const target = /** @type {Element | null} */ (event.target instanceof Element ? event.target : null);
    if (!target) return;

    const button = /** @type {HTMLButtonElement | null} */ (target.closest('button[data-action]'));
    if (!button || !results.contains(button)) return;

    const card = /** @type {HTMLLIElement | null} */ (button.closest('li[data-id]'));
    if (!card || !results.contains(card)) return;

    const id = Number(card.dataset.id);
    if (Number.isNaN(id)) return;

    const action = button.dataset.action;

    if (action === 'toggle') {
      const nextCard = /** @type {HTMLLIElement | null} */ (card.nextElementSibling);
      const prevCard = /** @type {HTMLLIElement | null} */ (card.previousElementSibling);
      const nextId = nextCard?.dataset.id ?? null;
      const prevId = prevCard?.dataset.id ?? null;

      toggle(id);

      if (countEl) {
        countEl.textContent = String(watchlist.size);
      }

      refresh();

      const sameToggle = /** @type {HTMLElement | null} */ (
        results.querySelector(`li[data-id="${id}"] [data-action="toggle"]`)
      );
      if (sameToggle) {
        sameToggle.focus();
        return;
      }

      if (nextId !== null) {
        const nextToggle = /** @type {HTMLElement | null} */ (
          results.querySelector(`li[data-id="${nextId}"] [data-action="toggle"]`)
        );
        if (nextToggle) {
          nextToggle.focus();
          return;
        }
      }

      if (prevId !== null) {
        const prevToggle = /** @type {HTMLElement | null} */ (
          results.querySelector(`li[data-id="${prevId}"] [data-action="toggle"]`)
        );
        if (prevToggle) {
          prevToggle.focus();
          return;
        }
      }

      const heading = /** @type {HTMLElement | null} */ (document.querySelector('#results-heading'));
      if (heading) {
        heading.focus();
      }
    } else if (action === 'details') {
      openDetails(id);
    }
  });
}
