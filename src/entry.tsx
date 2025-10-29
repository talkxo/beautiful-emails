import { hasSession, mountLogin } from './auth';

const mountPoint = document.getElementById('root')!;

if (hasSession()) {
  import('./main');
} else {
  mountLogin(mountPoint);
}


