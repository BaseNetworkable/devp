import App from '../App/App';
import React from 'react';
import { StaticRouter } from 'react-router-dom';
import express from 'express';
import { renderToString } from 'react-dom/server';
import {Footer} from '../App/comps/Footer.jsx';


const assets = require(process.env.RAZZLE_ASSETS_MANIFEST);

const cssLinksFromAssets = (assets, entrypoint) => {
  return assets[entrypoint] ? assets[entrypoint].css ?
  assets[entrypoint].css.map(asset=>
    `<link rel="stylesheet" href="${asset}">`
  ).join('') : '' : '';
};

const jsScriptTagsFromAssets = (assets, entrypoint, ...extra) => {
  return assets[entrypoint] ? assets[entrypoint].js ?
  assets[entrypoint].js.map(asset=>
    `<script src="${asset}" ${extra.join(" ")}></script>`
  ).join('') : '' : '';
};

export const renderApp = (req, _res) => {
  const context = {};
  const markup = renderToString(
    <StaticRouter context={context} location={req.url}>
      <App />
    </StaticRouter>
  );
  const html = `<!doctype html>
  <html lang="" >
  <head>
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta charset="utf-8" />
      <link rel="icon" type="image/x-icon" href="../public/favicon.png">
      <title>junix.ru</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <link rel="preconnect" href="https://fonts.googleapis.com"/>
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true"/>
      <link href="https://fonts.googleapis.com/css2?family=Varela&display=swap" rel="stylesheet"/>
      ${cssLinksFromAssets(assets, 'client')}
  </head>
  <body>
      <div id="root">${markup}</div>
      ${jsScriptTagsFromAssets(assets, 'client', 'defer', 'crossorigin')}
  </body>
    
</html>`
  return {context, html};
}

const server = express();
server
  .disable('x-powered-by')
  .use(express.static(process.env.RAZZLE_PUBLIC_DIR))
  .get('/*', (req, res) => {
    const {context, html} = renderApp(req, res);
    if (context.url) {
      res.redirect(context.url);
    } else {
      res.status(200).send(html);
    }
  });

export default server;
