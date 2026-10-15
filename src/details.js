import { getShow, notes, saveNote } from './state.js';

/** @type {number | null} */
let currentShowId = null;

/**
 * Повертає фокус на кнопку «Детальніше» картки поточного серіалу.
 */
function restoreFocusToDetailsButton() {
  if (currentShowId === null) return;
  const button = /** @type {HTMLElement | null} */ (
    document.querySelector(`#results li[data-id="${currentShowId}"] [data-action="details"]`)
  );
  if (button) {
    button.focus();
  }
}

/**
 * Очищає помилку валідації поля оцінки.
 */
function clearRatingError() {
  const ratingInput = /** @type {HTMLInputElement | null} */ (document.querySelector('#note-rating'));
  const errorEl = /** @type {HTMLElement | null} */ (document.querySelector('#note-rating-error'));
  if (ratingInput) {
    ratingInput.removeAttribute('aria-invalid');
  }
  if (errorEl) {
    errorEl.textContent = '';
  }
}

/**
 * C4. Відкриває діалог #details для серіалу: назва, опис, посилання на сторінку TVmaze і форма
 * з моєю оцінкою й нотаткою. Специфікація — ТЗ, C4.
 *
 * @param {number} id
 */
export function openDetails(id) {
  const show = getShow(id);
  currentShowId = id;

  const dialog = /** @type {HTMLDialogElement | null} */ (document.querySelector('#details'));
  const titleEl = /** @type {HTMLElement | null} */ (document.querySelector('#details-title'));
  const summaryEl = /** @type {HTMLElement | null} */ (document.querySelector('#details-summary'));
  const linkEl = /** @type {HTMLAnchorElement | null} */ (document.querySelector('#details-link'));
  const ratingInput = /** @type {HTMLInputElement | null} */ (document.querySelector('#note-rating'));
  const textInput = /** @type {HTMLTextAreaElement | null} */ (document.querySelector('#note-text'));

  if (!dialog) return;

  if (titleEl) {
    titleEl.textContent = show.name;
  }

  if (linkEl) {
    linkEl.href = show.url;
  }

  if (summaryEl) {
    const parsedDoc = new DOMParser().parseFromString(show.summary ?? '', 'text/html');
    const paragraphs = [];
    const childElements = [...parsedDoc.body.children];

    if (childElements.length > 0) {
      for (const el of childElements) {
        const text = (el.textContent ?? '').trim();
        if (text) {
          const p = document.createElement('p');
          p.textContent = text;
          paragraphs.push(p);
        }
      }
    }

    if (paragraphs.length === 0) {
      const fallbackText = (parsedDoc.body.textContent ?? '').trim();
      if (fallbackText) {
        const p = document.createElement('p');
        p.textContent = fallbackText;
        paragraphs.push(p);
      }
    }

    summaryEl.replaceChildren(...paragraphs);
  }

  clearRatingError();

  const savedNote = notes.get(id);
  if (ratingInput) {
    ratingInput.value = savedNote ? String(savedNote.rating) : '';
  }
  if (textInput) {
    textInput.value = savedNote ? savedNote.text : '';
  }

  if (!dialog.open) {
    dialog.showModal();
  }
}

/**
 * C4. Підключає діалог #details: закриття й форму «Моя оцінка й нотатка». main.js викликає цю
 * функцію один раз. Специфікація — ТЗ, C4.
 *
 * @param {() => void} refresh перемальовує список для поточних фільтрів
 */
export function initDetails(refresh) {
  const dialog = /** @type {HTMLDialogElement | null} */ (document.querySelector('#details'));
  const form = /** @type {HTMLFormElement | null} */ (document.querySelector('#note-form'));
  const ratingInput = /** @type {HTMLInputElement | null} */ (document.querySelector('#note-rating'));
  const textInput = /** @type {HTMLTextAreaElement | null} */ (document.querySelector('#note-text'));
  const errorEl = /** @type {HTMLElement | null} */ (document.querySelector('#note-rating-error'));
  const statusEl = /** @type {HTMLElement | null} */ (document.querySelector('#status'));

  if (!dialog || !form) return;

  dialog.addEventListener('close', () => {
    restoreFocusToDetailsButton();
  });

  const cancelButton = /** @type {HTMLButtonElement | null} */ (
    form.querySelector('button[type="button"]')
  );
  if (cancelButton) {
    cancelButton.addEventListener('click', () => {
      dialog.close();
      restoreFocusToDetailsButton();
    });
  }

  if (ratingInput) {
    ratingInput.addEventListener('input', () => {
      clearRatingError();
    });
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (currentShowId === null || !ratingInput) return;

    const rating = ratingInput.valueAsNumber;
    if (!Number.isInteger(rating) || rating < 1 || rating > 10) {
      ratingInput.setAttribute('aria-invalid', 'true');
      if (errorEl) {
        errorEl.textContent = 'Введіть ціле число від 1 до 10.';
      }
      ratingInput.focus();
      return;
    }

    clearRatingError();

    const text = textInput ? textInput.value : '';
    const show = getShow(currentShowId);

    saveNote(currentShowId, { rating, text });
    refresh();

    if (statusEl) {
      statusEl.textContent = `Нотатку до ${show.name} збережено`;
    }

    dialog.close();
    restoreFocusToDetailsButton();
  });
}
