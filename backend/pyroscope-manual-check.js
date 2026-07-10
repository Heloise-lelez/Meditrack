import dotenv from 'dotenv';
dotenv.config();
import Pyroscope from '@pyroscope/nodejs';

console.log('Démarrage test Pyroscope...');
console.log('serverAddress:', process.env.PYROSCOPE_SERVER_ADDRESS);

Pyroscope.init({
  serverAddress: process.env.PYROSCOPE_SERVER_ADDRESS,
  appName: 'meditrack-backend',
  basicAuthUser: process.env.PYROSCOPE_USER,
  basicAuthPassword: process.env.PYROSCOPE_TOKEN,
});
Pyroscope.start();

// Boucle CPU intensive pour générer du signal à profiler
setInterval(() => {
  let sum = 0;
  for (let i = 0; i < 50_000_000; i++) sum += Math.sqrt(i);
  console.log('Calcul terminé, sum =', sum);
}, 3000);
