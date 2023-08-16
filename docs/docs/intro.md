---
sidebar_position: 1
---

# Tutorial Intro

Let's discover **Three Keko**.

## Getting Started


```bash
npm install @ag-three/interaction
```

Get started by **creating a new application**.

The application's core is the main class, which handles the renderer and other settings. It is responsible for initializing, updating and rendering the application components.

### What you'll need

- [Node.js](https://nodejs.org/en/download/) version 16.14 or above:

  - When installing Node.js, you are recommended to check all checkboxes related to dependencies.

- [Three.js](https://threejs.org/): version 0.155.0 or above

  - Three.js is a JavaScript library for creating 3D graphics on the web. It is lightweight, and cross-browser compatible.

- if use [TypeScript](https://www.typescriptlang.org/), you need to add in your tsconfig.json this paths in compilerOptions:

```json
		"paths": {
			"three": [
				"./node_modules/@ag-three/interaction/Types"
			]
		}
```

## Let's start

<iframe height="600px" width="100%" src="https://stackblitz.com/edit/vitejs-vite-x96mgz?embed=1&file=src%2Fmain.ts&hideExplorer=1&hideNavigation=1"></iframe>

You can type this command into Command Prompt, Powershell, Terminal, or any other integrated terminal of your code editor.

The command also installs all necessary dependencies you need to run Docusaurus.

## Start your site

Run the development server:

```bash
cd my-website
npm run start
```

The `cd` command changes the directory you're working with. In order to work with your newly created Docusaurus site, you'll need to navigate the terminal there.

The `npm run start` command builds your website locally and serves it through a development server, ready for you to view at http://localhost:3000/.

Open `docs/intro.md` (this page) and edit some lines: the site **reloads automatically** and displays your changes.
