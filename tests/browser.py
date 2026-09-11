"""Exercise built/live UI using disposable browser data and intercepted providers."""
import argparse
import functools
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
import threading
import time
from urllib.parse import urlsplit

from playwright.sync_api import expect, sync_playwright

ROOT = Path(__file__).resolve().parents[1]
IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="88"%3E%3Crect width="64" height="88" fill="%233b82f6"/%3E%3C/svg%3E'
FAVORITES = [
    {'id': f'fixture-{i}', 'rarity': 'common', 'card': {
        'id': f'set-{i}', 'name': name, 'set': {'id': f'set-{i}', 'name': f'Fixture Set {i}'},
        'number': str(i), 'rarity': 'Common', 'images': {'small': IMAGE, 'large': IMAGE},
        'attacks': [{'name': 'Fixture attack', 'damage': '0', 'text': 'Quotes " and Unicode: 水'}],
    }} for i, name in enumerate(['Fixture Alpha', 'Fixture Beta 水'], 1)
]
PACK = [FAVORITES[0]]
CARDS = [{'id': f'cache-{i}', 'set_id': 'fixture', 'set_name': 'Fixture', 'card_number': str(i),
          'image_url': IMAGE, 'imageData': IMAGE, 'filename': f'fixture-{i}.png'} for i in range(32)]
INIT = """(() => {
  const config = CONFIG;
  const store = config.backend === 'local' ? localStorage : sessionStorage;
  if (!store.getItem('__qa_seeded')) {
    for (const [key, value] of Object.entries(config.values)) store.setItem(key, JSON.stringify(value));
    store.setItem('unrelated', 'preserve this fixture');
    store.setItem('__qa_seeded', 'true');
  }
  let full = config.quota;
  const setItem = Storage.prototype.setItem;
  Storage.prototype.setItem = function(key, value) {
    if (this === store && full) throw new DOMException('Synthetic full storage', 'QuotaExceededError');
    return setItem.call(this, key, value);
  };
  window.__storageFixture = {
    read: () => ({favorites: JSON.parse(store.getItem('favorites')), pack: JSON.parse(store.getItem('currentPack')), unrelated: store.getItem('unrelated')}),
    allowWrites: () => { full = false; },
    xhr: [],
  };
  const send = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.send = function(...args) {
    const entry = {timeout: this.timeout, aborted: false, timedOut: false};
    this.addEventListener('abort', () => { entry.aborted = true; });
    this.addEventListener('timeout', () => { entry.timedOut = true; });
    window.__storageFixture.xhr.push(entry);
    return send.apply(this, args);
  };
  if (config.backend === 'local') Object.defineProperty(window, 'sessionStorage', {
    get() { throw new DOMException('Synthetic blocked session storage', 'SecurityError'); }
  });
})();"""


class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        # Honor the exact rewrites that ship, rather than inventing an SPA fallback.
        config = json.loads((ROOT / 'vercel.json').read_text(encoding='utf-8'))
        for rewrite in config.get('rewrites', []):
            if urlsplit(self.path).path == rewrite['source']:
                self.path = rewrite['destination']
                break
        try:
            super().do_GET()
        except ConnectionError:
            # Closing a disposable context can cancel an unfinished static asset.
            pass

    def log_message(self, *_args):
        pass


def initialize(context, backend, quota):
    context.add_init_script(INIT.replace('CONFIG', json.dumps({
        'backend': backend, 'quota': quota,
        'values': {'favorites': FAVORITES, 'currentPack': PACK,
                   'pokemon_session_cards': {'cards': CARDS, 'shownCardIds': [], 'isLoading': False, 'lastLoadTime': 1}},
    })))


def backup(page):
    with page.expect_download() as event:
        page.get_by_role('button', name='Export favorites', exact=True).click()
    download = event.value
    assert download.suggested_filename == 'pokemonpacks-favorites.json'
    result = json.loads(Path(download.path()).read_text(encoding='utf-8'))
    assert result['format'] == 'pokemonpacks-favorites' and result['version'] == 1
    return result['favorites']


def run(base, output, only='all', smoke=False):
    origin = urlsplit(base).netloc
    allowed_origins = {origin}
    # The public Vercel alias has an existing 301 to the custom domain.
    # Permit only these known aliases; provider traffic remains intercepted.
    public_origins = {'pokemonpacks.vercel.app', 'pokemonpacks.hong-yi.me'}
    if origin in public_origins:
        allowed_origins.update(public_origins)
    output.mkdir(parents=True, exist_ok=True)
    results = []
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        storage_cases = [('session', False, 1440), ('session', True, 1440), ('local', False, 1440), ('session', False, 390), ('local', True, 390)]
        if smoke:
            storage_cases = [('local', True, 390)]
        for backend, quota, width in storage_cases if only != 'api' else []:
            label = f'{backend}-{"quota" if quota else "writable"}-{width}'
            context = browser.new_context(viewport={'width': width, 'height': 950}, service_workers='block', reduced_motion='reduce')
            initialize(context, backend, quota)
            external, errors = [], []

            def route_request(route):
                if urlsplit(route.request.url).netloc in allowed_origins:
                    route.continue_()
                else:
                    external.append(urlsplit(route.request.url).netloc)
                    route.abort()

            context.route('**/*', route_request)
            page = context.new_page()
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.goto(base)
            page.get_by_role('button', name='Faves (2)', exact=True).click()
            expect(page.get_by_role('button', name='Remove', exact=True)).to_have_count(2)
            # Export includes the complete collection even when a filter hides a card.
            page.get_by_role('textbox', name='Search favorites').fill('Alpha')
            expect(page.get_by_role('button', name='Remove', exact=True)).to_have_count(1)
            assert backup(page) == FAVORITES
            page.get_by_role('textbox', name='Search favorites').fill('')
            page.get_by_role('button', name='Remove', exact=True).first.click()
            expect(page.get_by_role('button', name='Faves (1)', exact=True)).to_be_visible()
            assert backup(page) == FAVORITES[1:]
            durable = page.evaluate('window.__storageFixture.read()')
            assert durable['favorites'] == (FAVORITES if quota else FAVORITES[1:])
            assert durable['pack'] == PACK and durable['unrelated'] == 'preserve this fixture'
            if quota:
                expect(page.get_by_text('Changes are temporary', exact=True)).to_be_visible()
                alert = page.get_by_role('status').filter(has_text='Changes are temporary')
                expect(alert).to_be_visible()
                assert alert.bounding_box()['y'] < 100
                assert 'Export your favorites' in alert.inner_text()
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
            page.screenshot(path=str(output / f'{label}.png'), full_page=False)
            # Cancel does nothing; confirmation updates the current backend without a reload.
            page.get_by_role('button', name='Remove All', exact=True).click()
            page.get_by_role('button', name='Cancel', exact=True).click()
            expect(page.get_by_role('button', name='Faves (1)', exact=True)).to_be_visible()
            page.get_by_role('button', name='Remove All', exact=True).click()
            page.get_by_role('button', name='Remove all favorites', exact=True).click()
            expect(page.get_by_text('No favorites yet!', exact=True)).to_be_visible()
            assert page.evaluate('window.__storageFixture.read().pack') == PACK
            assert page.evaluate('window.__storageFixture.read().favorites') == (FAVORITES if quota else [])
            page.reload()
            expected_count = 2 if quota else 0
            expect(page.get_by_role('button', name=f'Faves ({expected_count})', exact=True)).to_be_visible()
            if quota:
                page.get_by_role('button', name='Faves (2)', exact=True).click()
                page.evaluate('window.__storageFixture.allowWrites()')
                page.get_by_role('button', name='Remove', exact=True).first.click()
                expect(page.get_by_role('button', name='Faves (1)', exact=True)).to_be_visible()
                assert page.evaluate('window.__storageFixture.read().favorites') == FAVORITES[1:]
            assert not external, external
            assert not errors, errors
            results.append({'case': label, 'status': 'passed', 'provider_requests': 0, 'resolved_url': page.url})
            print(json.dumps(results[-1]), flush=True)
            context.close()

        api_cases = ['success'] if smoke else ['success', 'rate-limit', 'timeout', 'leave']
        for behavior in api_cases if only != 'storage' else []:
            context = browser.new_context(service_workers='block')
            initialize(context, 'session', False)
            requests, unexpected, errors, stalled = [], [], [], []

            def api_route(route):
                request = route.request
                parts = urlsplit(request.url)
                if parts.netloc in allowed_origins:
                    route.continue_()
                elif parts.netloc == 'api.pokemontcg.io':
                    assert parts.path == '/v2/sets' and parts.query == 'pageSize=1'
                    assert request.method == 'GET'
                    assert 'x-api-key' not in request.headers and 'authorization' not in request.headers
                    requests.append(parts.path)
                    if behavior in ['timeout', 'leave']:
                        stalled.append(route)  # Remains intercepted; no external network connection.
                    else:
                        route.fulfill(status=200 if behavior == 'success' else 429,
                                      content_type='application/json', headers={'Access-Control-Allow-Origin': '*'},
                                      body=json.dumps({'data': [{'id': 'fixture', 'name': 'Fixture'}]}))
                else:
                    unexpected.append(parts.netloc)
                    route.abort()

            context.route('**/*', api_route)
            page = context.new_page()
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.goto(base.rstrip('/') + '/test')
            started = time.monotonic()
            page.get_by_role('button', name='Check connection', exact=True).click()
            page.wait_for_function('window.__storageFixture.xhr.length === 1')
            assert page.evaluate('window.__storageFixture.xhr[0].timeout') == 20000
            if behavior == 'leave':
                page.get_by_role('button', name='Back to Home', exact=True).click()
                expect(page.get_by_role('button', name='Faves (2)', exact=True)).to_be_visible()
                page.wait_for_function('window.__storageFixture.xhr[0].aborted')
            else:
                message = 'Card service is available.' if behavior == 'success' else 'Card service is unavailable or rate limited. Please try again later.'
                expect(page.get_by_text(message, exact=True)).to_be_visible(timeout=25000)
                expect(page.get_by_role('button', name='Check connection', exact=True)).to_be_enabled()
            elapsed = time.monotonic() - started
            if behavior == 'timeout':
                assert 19 <= elapsed < 26, elapsed
                assert page.evaluate('window.__storageFixture.xhr[0].timedOut')
            assert len(requests) == 1, requests
            assert page.evaluate('window.__storageFixture.read().favorites') == FAVORITES
            assert page.evaluate('window.__storageFixture.read().pack') == PACK
            assert not errors and not unexpected, (errors, unexpected)
            results.append({'case': f'api-{behavior}', 'status': 'passed', 'intercepted_requests': 1, 'elapsed_seconds': round(elapsed, 2), 'resolved_url': page.url})
            print(json.dumps(results[-1]), flush=True)
            for route in stalled:
                route.abort()
            context.unroute_all(behavior='wait')
            context.close()
        browser.close()
    (output / 'browser-results.json').write_text(json.dumps({'base': base, 'checks': results, 'real_provider_requests': 0}, indent=2) + '\n', encoding='utf-8')


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--url')
    parser.add_argument('--output', type=Path, default=ROOT / 'browser-results')
    parser.add_argument('--only', choices=['all', 'storage', 'api'], default='all')
    parser.add_argument('--smoke', action='store_true')
    args = parser.parse_args()
    server = None
    try:
        base = args.url
        if not base:
            server = ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Handler, directory=str(ROOT / 'dist')))
            threading.Thread(target=server.serve_forever, daemon=True).start()
            base = f'http://127.0.0.1:{server.server_port}'
        run(base, args.output, args.only, args.smoke)
    finally:
        if server:
            server.shutdown()
            server.server_close()
