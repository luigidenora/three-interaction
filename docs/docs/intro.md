---
sidebar_position: 1
---

# Tutorial Intro

Let's discover **Docusaurus in less than 5 minutes**.

## Getting Started

Get started by **creating a new site**.

Or **try Docusaurus immediately** with **[docusaurus.new](https://docusaurus.new)**.

### What you'll need

- [Node.js](https://nodejs.org/en/download/) version 16.14 or above:
  - When installing Node.js, you are recommended to check all checkboxes related to dependencies.

## Generate a new site

```jsx live
function ThreeScene() {
  const sceneRef = useRef(null);

  useEffect(() => {
    const scene = new Scene().add(new PerspectiveCamera(70, 1, 10000).translateZ(10));
    scene.interceptByRaycaster = false;

    const points = [];
    for (let i = 0; i < 20; i++) {
      debugger;
      const point = new Mesh(new SphereGeometry(0.1), new MeshBasicMaterial({ color: 0xffffff * Math.random() }));
      points.push(point);
      scene.add(point);
      point.on('animate', e =>
        point.position.set(-Math.cos((e.total / 10) * (i + 1)) * 5, Math.sin((e.total / 10) * (i + 1)) * 5),
      );
    }

    for (let i = 0; i < points.length - 1; i++) {
      for (let j = i + 1; j < points.length; j++) {
        scene.add(new LinkedLine(points[i], points[j]));
      }
    }
  }, []);

  return <div ref={sceneRef} />;
}
```

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
