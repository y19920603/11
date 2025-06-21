<template>
  <div class="text-wrapper">
    <div class="title" data-content="404">403 - ACCESS DENIED</div>

    <div class="subtitle">Oops, You don't have permission to access this page.</div>

    <div class="buttons">
      <router-link to="/dashboard" class="button">Back to Dashboard</router-link>
    </div>
  </div>
</template>

<style lang="scss" scoped>
body {
  font-family: "Raleway", sans-serif;
  background-color: #342643;
  height: 100%;
  padding: 10px;
}

a {
  color: #ee4b5e !important;
  text-decoration: none;
}
a:hover {
  color: #ffffff !important;
  text-decoration: none;
}

.text-wrapper {
  height: calc(100vh - $navbar-height);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.title {
  font-size: 5em;
  font-weight: 700;
  color: #ee4b5e;
}

.subtitle {
  font-size: 40px;
  font-weight: 700;
  color: #1fa9d6;
}
.isi {
  font-size: 18px;
  text-align: center;
  margin: 30px;
  padding: 20px;
  color: white;
}
.buttons {
  margin: 30px;
  font-weight: 700;
  border: 2px solid #ee4b5e;
  text-decoration: none;
  padding: 15px;
  text-transform: uppercase;
  color: #ee4b5e;
  border-radius: 26px;
  transition: all 0.2s ease-in-out;
  display: inline-block;

  .buttons:hover {
    background-color: #ee4b5e;
    color: white;
    transition: all 0.2s ease-in-out;
  }
}
</style>
