<!-- GUIA PARA LEVANTAR EL PROYECTO -->

<!-- 1. EJECUTAR SCRIPT CERTIFICADOS -->
# cd Backend
# ./scripts/createCerts.ps1
<!-- 2. EJECUTAR SEEDS BASES DE DATOS -->
# node ./seeds/projects.seed.js
# node ./seeds/users.seed.js

<!-- 3. INSTALAR DEPENDENCIAS BACKEND -->
# npm i
# npm i -g nodemon

<!-- 4. LEVANTAR BACKEND -->
# nodemon

<!-- 5. INSTALAR DEPENDENCIAS FRONTEND -->
# cd ..
# cd Frontend
# npm i

<!-- 6. LEVANTAR FRONTEND -->
# npm run dev