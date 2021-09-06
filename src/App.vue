<template>
  <div id="app">
    <div id="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link>
    </div>
    <router-view/>
  </div>
</template>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100vh;
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}

// #popup.ol-popup {
//   position: absolute;
//   background-color: white;
//   box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
//   padding: 15px;
//   border-radius: 10px;
//   border: 1px solid #cccccc;
//   bottom: 12px;
//   left: -50px;
//   min-width: 180px;
//   display: none;
// }
// #popup.ol-popup:after,
// #popup.ol-popup:before {
//   top: 100%;
//   border: solid transparent;
//   content: " ";
//   height: 0;
//   width: 0;
//   position: absolute;
//   pointer-events: none;
// }
// #popup.ol-popup:after {
//   border-top-color: white;
//   border-width: 10px;
//   left: 48px;
//   margin-left: -10px;
// }
// #popup.ol-popup:before {
//   border-top-color: #cccccc;
//   border-width: 11px;
//   left: 48px;
//   margin-left: -11px;
// }
// #popup .ol-popup-closer {
//   text-decoration: none;
//   position: absolute;
//   top: 2px;
//   right: 8px;
// }
// #popup .ol-popup-closer:after {
//   content: "✖";
// }
// #popup div#popup-content>div {
//     text-align: left;
//     margin: 4px auto;
// }
</style>
