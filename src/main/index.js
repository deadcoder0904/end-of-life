import { app, BrowserWindow, Tray, nativeImage } from 'electron';
import * as path from 'path';
import { format as formatUrl } from 'url';
import { sync as DataURI } from 'datauri';
import { JSDOM } from 'jsdom';
import getContext from 'get-canvas-context';
// import svg2png from 'svg-to-png';

// import icon from "../assets/progress-bar.svg";

const isDevelopment = process.env.NODE_ENV !== 'production';

// const dom = new JSDOM(`<!DOCTYPE html><p>Hello world</p>`);
// console.log(dom.window.document.querySelector('p').textContent);
const dom = new JSDOM("<canvas width='99' height='101'></canvas>");
const canvas = dom.window.document.querySelector('canvas');

// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow;

const drawInlineSVG = (svgElement, ctx, callback) => {
  const svgURL = new JSDOM(
    `new XMLSerializer().serializeToString(${svgElement})`
  );
  const img = new JSDOM(`new Image()`);
  img.onload = function() {
    ctx.drawImage(this, 0, 0);
    callback();
  };
  img.src = `data:image/svg+xml; charset=utf8, ${encodeURIComponent(svgURL)}`;
};

const createMainWindow = () => {
  const window = new BrowserWindow();

  if (isDevelopment) {
    window.webContents.openDevTools();
  }

  if (isDevelopment) {
    window.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`);
  } else {
    window.loadURL(
      formatUrl({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file',
        slashes: true
      })
    );
  }

  // await svg2png.convert(
  //   path.join(__dirname, "../assets/progress-bar.svg"),
  //   path.join(__dirname, "../assets/tmp/progress-bar.png")
  // );
  const ctxt = getContext('2d');

  drawInlineSVG(
    path.join(__dirname, '../assets/progress-bar.svg'),
    ctxt,
    function() {
      console.log(`===================`);
      console.log(canvas.toDataURL());
      console.log(`===================`);

      let trayIcon = nativeImage.createFromDataURL(canvas.toDataURL());
      new Tray(trayIcon);
    }
  );

  // let trayIcon = nativeImage.createFromDataURL(
  //   DataURI(path.join(__dirname, '../assets/progress-bar.png'))
  // );
  // new Tray(trayIcon);

  window.on('closed', () => {
    mainWindow = null;
  });

  window.webContents.on('devtools-opened', () => {
    window.focus();
    setImmediate(() => {
      window.focus();
    });
  });

  return window;
};

// quit application when all windows are closed
app.on('window-all-closed', () => {
  // on macOS it is common for applications to stay open until the user explicitly quits
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // on macOS it is common to re-create a window even after all windows have been closed
  if (mainWindow === null) {
    mainWindow = createMainWindow();
  }
});

// create main BrowserWindow when electron is ready
app.on('ready', () => {
  mainWindow = createMainWindow();
});
