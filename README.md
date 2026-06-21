# FVTT Icons — Image Search

Search the Foundry VTT icon library by **tag** and **description**, browse a mosaic of results, and click any image to **copy its path** to the clipboard. Paste it into any image field.

![Foundry v13+](https://img.shields.io/badge/Foundry-v13%2B-informational)

## Features

- Live search across icon filename, tags and description (multi-term, AND match).
- Sidebar result list + large mosaic preview.
- Adjustable preview size (small / medium / large).
- Click an image (list row or mosaic card) to copy its path.
- Shortcut button inside Foundry's **File Picker**: opens the search and drops the chosen path straight into the file field.
- Lazy image loading — only loads thumbnails as they scroll into view, so searches returning hundreds of icons stay responsive.
- Adapts to Foundry's light and dark application themes.

## Installation

**Manifest URL** (Foundry → Add-on Modules → Install Module → paste):

```
https://github.com/mordachai/fvtt-icons/releases/latest/download/module.json
```

**Or clone directly into your modules folder:**

```bash
cd <FoundryUserData>/Data/modules
git clone https://github.com/mordachai/fvtt-icons.git
```

The repository folder name matches the module id (`fvtt-icons`), so it works immediately after cloning.

## Usage

Enable the module in your world. On first launch it creates a macro **"FVTT Icons Search"** — drag it to your hotbar.

You can also open it from a script macro or the console:

```js
Icons.Open();
```

When picking an image for any field, click the **icon-search button** next to Foundry's File Picker browse button — choose an image and it's applied automatically.

## Database

Search runs against `ImageDatabase_clean.json` bundled with the module: an array of
`{ "path", "tags": [...], "description" }` entries.

## License

[MIT](LICENSE)
