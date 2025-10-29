import { hasSession, mountLogin } from './auth';

const mountPoint = document.getElementById('root')!;

if (hasSession()) {
  import('./image');
} else {
  mountLogin(mountPoint);
}


