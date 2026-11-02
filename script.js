const root = document.getElementById('content');

let data = { posts: [], media: [], links: [], home: [] };

const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[char]));

const media = item => item?.image
  ? `<img src="${esc(encodeURI(item.image))}" alt="${esc(item.alt || '')}" style="width:100%;height:auto;display:block">`
  : '';

function render() {
  let [route, id] = location.hash.slice(1).split('/');
  route = route || 'home';

  document.querySelectorAll('nav a').forEach(link => {
    const active = link.dataset.route === route;
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });

  let html = '';

  if (route === 'home') {
    let entries = Array.isArray(data.home) ? data.home : [];
    const template = data.home_template;
    if (!entries.length && template && (template.image || template.date || template.excerpt)) {
      entries = [template];
    }
    html = '<section class="feed">' + entries.map(entry => `
      <article class="entry">
        ${entry.image ? media(entry) : ''}
        ${entry.date ? `<time>${esc(entry.date)}</time>` : ''}
        ${(entry.excerpt || entry.body) ? `<p style="white-space:pre-line">${esc(entry.excerpt || entry.body)}</p>` : ''}
      </article>
    `).join('') + '</section>';

  } else if (route === 'notes' && id !== undefined) {
    const post = data.posts?.[Number(id)];
    html = post ? `<article class="page">
      <a class="back" href="#notes">← notes</a>
      <p>${esc(post.date)}</p>
      <h1>${esc(post.title)}</h1>
      ${post.image ? media(post) : ''}
      <p class="entry-body" style="white-space:pre-line">${esc(post.body || post.excerpt || '')}</p>
    </article>` : '<p>Entry not found.</p>';

  } else if (route === 'notes') {
    html = '<section class="page"><h1>notes</h1>' +
      (data.posts?.length ? data.posts.map((post, index) => `
        <div class="item">${esc(post.date)}<br><a href="#notes/${index}">${esc(post.title || 'untitled')}</a></div>
      `).join('') : '<p class="empty">No notes yet.</p>') + '</section>';

  } else if (route === 'photos') {
    html = '<section class="page"><h1>photos / movies</h1>' +
      (data.media?.length ? '<div class="media-grid">' + data.media.map(item => `
        <div>${media(item)}<p>${esc(item.caption || '')}</p></div>
      `).join('') + '</div>' : '<p class="empty">No photographs or films yet.</p>') + '</section>';

  } else if (route === 'elsewhere') {
    html = '<section class="page elsewhere"><h1>elsewhere</h1>' +
      (data.links?.length ? data.links.map(link => `
        <div class="item"><a href="${esc(link.url)}" target="_blank" rel="noopener noreferrer">${esc(link.label)} ↗</a></div>
      `).join('') : '<p class="empty">No links yet.</p>') + '</section>';

  } else {
    html = '<p>Page not found.</p>';
  }

  root.innerHTML = html;
}

fetch('content.json')
  .then(response => {
    if (!response.ok) throw new Error('Unable to load content.json');
    return response.json();
  })
  .then(json => { data = json; render(); })
  .catch(() => { root.innerHTML = '<p>Unable to load content.</p>'; });

window.addEventListener('hashchange', render);
