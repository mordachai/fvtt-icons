[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/W7W01A1ZN1)

# FVTT Icons — Image Search

Search the Foundry VTT icon library by **tag** and **description**, browse a mosaic of results, and click any image to **copy its path** to the clipboard. Paste it into any image field.

![Foundry v14](https://img.shields.io/badge/foundry-v14-blue?style=for-the-badge) ![Github All Releases](https://img.shields.io/github/downloads/mordachai/fvtt-icons/total.svg?style=for-the-badge) ![GitHub Release](https://img.shields.io/github/v/release/mordachai/fvtt-icons?display_name=tag&style=for-the-badge&label=Current%20version) 

<img width="950" alt="fvtt-icons-search" src="https://github.com/user-attachments/assets/df46f377-aa0a-4d0c-86ec-c2e74914ff4d" />

## Features

- When picking an image for any field, click the **icon-search button** next to Foundry's File Picker browse button — choose an image and it's applied automatically:

<img width="591" height="304" alt="image" src="https://github.com/user-attachments/assets/aaa3439c-eb7f-4e55-979a-a55f04a10e0c" />

- Live search across icon filename, tags and description (multi-term, AND match).
- Click an image (list row or mosaic card) to copy its path.
- Lazy image loading — only loads thumbnails as they scroll into view, so searches returning hundreds of icons stay responsive.

## Installation

**Manifest URL** (Foundry → Add-on Modules → Install Module → paste):

```
https://github.com/mordachai/fvtt-icons/releases/latest/download/module.json
```

## Usage

Enable the module in your world. On first launch it creates a macro **"FVTT Icons Search"** — drag it to your hotbar.

You can also open it from a script macro or the console:

```js
Icons.Open();
```

## Database

Search runs against `ImageDatabase_clean.json` bundled with the module: an array of
`{ "path", "tags": [...], "description" }` entries.

## License

[MIT](LICENSE)
