# Ivana Dipp — Custom Question Help

Static GitHub Pages upload package. No build, package installation, tokens, API keys or applicant-data storage.

## What is ready

- `index.html`: three-question standalone design demonstration. This does not connect to form answers.
- `tooltip.css`, `tooltip.js`, `demo.css`: demonstration component and layout.
- `widget.html`, `widget.css`, `widget.js`: configurable display-only Jotform iframe widget entry point.
- `.nojekyll`: serves these static files directly.

Appearance follows the current calendar reference: 24×24px forest-green circle in a 36×36px transparent button, white 15px bold Caudex question mark. Panel: Smoky Eucalyptus #4D665E, white Caudex 16px/1.4, 14px radius, 18px 20px padding; at widget widths <=330px, 15px text and 16px padding.

## Upload online

1. Use a separate repository or a dedicated subfolder in your existing widget repository. Do not overwrite calendar files.
2. Upload these individual extracted files, keeping their names and relative locations. Uploading only the ZIP will not host the widget.
3. Under repository Settings → Pages, select Deploy from a branch, the branch containing the files, and /(root) (or the relevant /docs source). Save.
4. Use GitHub’s displayed Pages URL. Open `index.html` to inspect the design. Open `widget.html?preview=1` directly for the iframe entry-point preview.
5. For Jotform registration use `widget.html` without `?preview=1`. The developer example supports private widgets before gallery approval; verify that this account can register/add it.

## Jotform widget settings

Type: iframe widget. Initial width: full available field width; test at 320px minimum. Initial height: 44px. Required: OFF. Do not attach validation, answer conditions, or progress calculations.

Register additional parameters with these exact names:

| Parameter | Purpose |
|---|---|
| HelpText | Existing helper message, plain text, including line breaks. Required for configuration, not an applicant requirement. |
| HelpLabel | Accessible button name, e.g. Help for ZIP Code. |

The SDK is loaded from https://js.jotform.com/JotFormCustomWidget.min.js . On its documented ready event the widget reads its own settings using getWidgetSetting. It requests only iframe height changes via requestFrameResize. It does not subscribe to submit, send data, read applicant answers, or change the parent form. Jotform documents that display-only widgets need not subscribe to submit.

## Important placement limitation — clone test still required

The iframe variant opens its panel ABOVE its own button within an expanded iframe. Its height grows and shrinks; the button moves down while open. This safely avoids drawing over other fields, but DOES NOT prove an overlay anchored beside an existing native question label. An iframe cannot paint outside itself. GitHub hosting cannot grant parent-form access.

The three-question demo shows the desired overlay beside labels because all those elements share one document. That parent-document arrangement is not installed in Jotform.

Do not position a separate iframe over native inputs or hide the existing help until one representative question passes a clone test. Exact same-line placement and unchanged form spacing remain unresolved integration requirements. If those requirements cannot be achieved through supported Jotform placement, report that limitation rather than changing original questions.

An iframe detects outside clicks only in its own document; blur closes the panel when the iframe loses focus, but a parent-page background tap may not always cause blur. Cross-frame one-open-at-a-time coordination and outside-tap dismissal remain unverified.

## Verification before live installation

1. Add one optional display-only instance to the test clone. Keep the existing questions and help text.
2. Verify settings load, button placement, panel expansion and collapse, no clipping/overlap or excessive spacing.
3. Check long helper text and conditional visibility. Do not detach a helper from its question’s conditions.
4. Test keyboard focus, Enter/Space, Escape, iPhone finger taps and actual Safari.
5. Confirm Back/Next, required validation and progress are unchanged. Stop before CAPTCHA or submission.
6. Verify print behavior in the parent form; child print styles hide widget content, but parent iframe spacing needs checking.
7. Only after clone passes should live installation be proposed. No form was modified while preparing this package.

## Privacy and dependencies

Helper messages are configuration, never applicant responses. No analytics, local/session storage, cookies, data-collection endpoint, or logging is implemented. Settings render via textContent so markup cannot execute. Static hosting receives normal asset requests; Google Fonts supplies Caudex and Jotform supplies its SDK. No secret belongs in a widget setting or repository. No personal applicant data is included.

## Evidence and status

Local Chrome iframe checks: 320, 375, 390, 430 and 752px. Each kept button36/circle24, rendered the panel above, and had no horizontal overflow. Escape hid the panel and returned focus. The SDK test harness used a stub to exercise settings and resize requests; this is NOT an authenticated Jotform integration test. The 390px example requested 44px collapsed and 204px expanded.

Not yet verified: actual Jotform SDK handshake/resize, native-label positioning, physical iPhone, Safari, multiple instances and parent print layout.

Official references:
- https://www.jotform.com/developers/widgets/
- https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
