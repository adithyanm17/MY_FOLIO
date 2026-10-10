# Adithyan M — Portfolio

A responsive static portfolio with an animated 3D sculpture, project filtering,
project detail dialogs, and resume downloads. No build tools are required.

## Preview

Open `index.html`, or serve this folder with:

```sh
python -m http.server 5173 --bind 127.0.0.1
```

Then visit `http://127.0.0.1:5173`.

## Maintain

- `index.html`: page content and project concept illustrations.
- `styles.css`: layout, responsive rules, and visual styling.
- `script.js`: project details, filters, navigation, contact draft, and 3D artwork.
- `Adithyan M.pdf`: the current resume used by every download link.

After changing the site or replacing the resume, rebuild the standalone copy:

```sh
python scripts/build-standalone.py
```

The standalone HTML embeds its CSS, JavaScript, portrait, and resume. Fonts load
from Google Fonts when online; local font fallbacks work offline.

The contact form opens the visitor's email application with a prepared draft;
it does not send messages or require a backend. Project illustrations are
labeled interface concepts, not screenshots of the actual applications.

Motion respects the device's reduced-motion preference and can be paused from
the opening section. Animation rendering pauses when the artwork is offscreen
or the browser tab is hidden.

For static hosting, publish `index.html`, `styles.css`, `script.js`,
`Adithyan.jpg`, and `Adithyan M.pdf` together. The standalone HTML is an
alternative shareable copy.
