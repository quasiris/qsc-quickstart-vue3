import { createStore } from 'vuex';
import VueCookies from 'vue-cookies';
import CryptoJS from 'crypto-js'; 
import { generateUniqueId } from '@/utils';

export default createStore({
  state: {
    sessionId: null,
    email: null,
    userId: null,
  },
  mutations: {
    setSessionId(state, sessionId) {
      state.sessionId = sessionId;
      VueCookies.set('sessionId', sessionId); // Set cookie
      VueCookies.remove('userId');  
    },
    clearSession(state) {
      state.sessionId = null;
      state.email = null;
      state.userID = null;
      VueCookies.remove('sessionId');
      VueCookies.remove('userId');  // Remove cookies
    },
    setUserEmail(state, email) {
      state.email = email;
      const hash = CryptoJS.SHA256(email).toString(CryptoJS.enc.Hex);
      const formattedHash = `${hash.slice(0, 4)}-${hash.slice(4, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}-${hash.slice(16, 22)}`;
      state.userId = formattedHash;
      VueCookies.remove('userId'); 
      VueCookies.set('userId', formattedHash);
    },
  },
  actions: {
    initializeSession({ commit }) {
      const sessionId = VueCookies.get('sessionId');
      if (sessionId) {
        commit('setSessionId', sessionId);
      } else {
        // Generate a new session ID if not present
        const newSessionId = generateUniqueId(); 
        commit('setSessionId', newSessionId);
      }
    },
    clearSession({ commit }) {
      commit('clearSession');
    },
    setUserEmail({ commit }, email) {
      commit('setUserEmail', email);
    },
  },
});
