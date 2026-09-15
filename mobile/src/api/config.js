import axios from 'axios';

// Since you are on a different network, we are tunneling the backend API over the internet.
const DEV_URL = 'https://large-baboons-enter.loca.lt/api';

axios.defaults.baseURL = DEV_URL;

// This header tells localtunnel to skip the phishing warning page and directly serve the JSON API responses
axios.defaults.headers.common['Bypass-Tunnel-Reminder'] = 'true';

export default axios;
