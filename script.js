const root = document.getElementById('content');

let data = { posts: [], media: [], links: [] };

const esc = s => String(s ?? '').replace(
  /[&<>"']/g,
  c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c])
);

const media = m => m?.image
  ? `<img src="${esc(encodeURI(m.image))}" alt="${esc(m.alt || '')}" style="width:100%;height:auto;display:block">`
  : '<div class="photo-placeholder">image / photograph</div>';

function render() {
  let [route, id] = location.hash.slice(1).split('/');
  route = route || 'home';

  document.querySelectorAll('nav a').forEach(a => {
    a.classList.toggle('active', a.dataset.route === route);

    if (a.dataset.route === route) {
      a.setAttribute('aria-current', 'page');
    } else {
      a.removeAttribute('aria-current');
    }
  });

  let html = '';

  if (route === 'home') {
    html = '<section class="feed">' +
      (data.posts.length
        ? data.posts.map(p => `
          <article class="entry">
            ${p.image ? media(p) : ''}
            ${p.date ? `<time>${esc(p.date)}</time>` : ''}
            ${p.excerpt || p.body
              ? `<p>${esc(p.excerpt || p.body)}</p>`
              : ''}
          </article>
        `).join('')
        : '<div class="empty">No entries yet.</div>') +
      '</section>';

  } else if (route === 'notes' && id !== undefined) {
    let p = data.posts[Number(id)];

    html = p
      ? `<article class="page">
          <a class="back" href="#notes">← notes</a>
          <p>${esc(p.date)}</p>
          <h1>${esc(p.title)}</h1>
          ${p.image ? media(p) : ''}
          <p class="entry-body">${esc(p.body || p.excerpt || '')}</p>
        </article>`
      : '<p>Entry not found.</p>';

  } else if (route === 'notes') {
    html = '<section class="page"><h1>notes</h1>' +
      (data.posts.length
        ? data.posts.map((p, i) => `
          <div class="item">
            ${esc(p.date)}<br>
            <a href="#notes/${i}">${esc(p.title || 'untitled')}</a>
          </div>
        `).join('')
        : '<p class="empty">No notes yet.</p>') +
      '</section>';

  } else if (route === 'photos') {
    html = '<section class="page"><h1>photos / movies</h1>' +
      (data.media.length
        ? '<div class="media-grid">' +
          data.media.map(m => `
            <div>
              ${media(m)}
              <p>${esc(m.caption || '')}</p>
            </div>
          `).join('') +
          '</div>'
        : '<p class="empty">No photographs or films yet.</p>') +
      '</section>';

  } else if (route === 'elsewhere') {
    html = '<section class="page elsewhere"><h1>elsewhere</h1>' +
      (data.links.length
        ? data.links.map(l => `
          <div class="item">
            <a href="${esc(l.url)}" target="_blank" rel="noopener noreferrer">
              ${esc(l.label)} ↗
            </a>
          </div>
        `).join('')
        : '<p class="empty">No links yet.</p>') +
      '</section>';

  } else {
    html = '<p>Page not found.</p>';
  }

  root.innerHTML = html;
}

fetch('content.json')
  .then(r => {
    if (!r.ok) throw new Error('Unable to load content.json');
    return r.json();
  })
  .then(j => {
    data = j;
    render();
  })
  .catch(() => {
    root.innerHTML = '<p>Unable to load content.</p>';
  });

window.addEventListener('hashchange', render);
