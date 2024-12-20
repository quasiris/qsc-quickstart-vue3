import { createStore } from 'vuex';
import VueCookies from 'vue-cookies';
import CryptoJS from 'crypto-js'; 
import { v4 as uuidv4 } from 'uuid';

export default createStore({
  state: {
    searchQuery: "", // Search Query
    sessionId: null,
    bottomSheet: false,
    email: null,
    userId: null,
    requestId: null,
    productsLoading: true, // products loading state
    facetsLoading: true, // facets loading state
    globalSheet: false, //  errror state
  },
  mutations: {
    setSearchQuery(state, q) {
      if(q.trim() != ''){
        const url = new URL(window.location.href);
        url.searchParams.set('q', q); 
        window.history.pushState({}, '', url);
      }else{
        const url = new URL(window.location.href);
        url.searchParams.delete('q');
        window.history.pushState({}, '', url);
      }
      state.searchQuery = q; 
    },
    setSessionId(state, sessionId) {
      state.sessionId = sessionId;
      VueCookies.set('sessionId', sessionId); // Set cookie
      VueCookies.remove('userId');  
    },
    clearSession(state) {
      state.sessionId = null;
      state.requestId = null;
      state.email = null;
      state.userId = null;
      state.globalSheet = false;
      VueCookies.remove('sessionId');
      VueCookies.remove('requestId'); 
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
    setRequestId(state, id) {
      state.requestId = id;
      VueCookies.remove('requestId'); 
      VueCookies.set('requestId', id);
    },
    setProductsLoading(state, value) {
      state.productsLoading = value; 
    },
    setFacetsLoading(state, value) {
      state.facetsLoading = value; 
    },
    setGlobalSheet(state, value) {
      state.globalSheet = value; 
      state.bottomSheet = true; 
    }, 
    stopBottomSheet(state, value) {
      state.bottomSheet = value; 
    },
  },
  actions: {
    initializeSession({ commit }) {
      const sessionId = VueCookies.get('sessionId');
      if (sessionId) {
        commit('setSessionId', sessionId);
      } else {
        // Generate a new session ID if not present
        const newSessionId = uuidv4(); 
        commit('setSessionId', newSessionId);
      }
    },
    clearSession({ commit }) {
      commit('clearSession');
    },
    setSearchQuery({ commit }, q) {
      commit('setSearchQuery', q);
    },
    stopBottomSheet({ commit }) {
      commit('stopBottomSheet', false);
    },
    setUserEmail({ commit }, email) {
      commit('setUserEmail', email);
    },
    setRequestId({ commit }, id) {
      commit('setRequestId', id);
    },
    startProductsLoading({ commit }) {
      commit('setProductsLoading', true); 
    },
    stopProductsLoading({ commit }) {
      commit('setProductsLoading', false); 
    },
    startFacetsLoading({ commit }) {
      commit('setFacetsLoading', true); 
    },
    showGlobalSheet({ commit }) {
      commit('setProductsLoading', true); 
      commit('setFacetsLoading', true); 
      commit('setGlobalSheet', true); 
    },
    stopFacetsLoading({ commit }) {
      commit('setFacetsLoading', false); 
    }, 
    hideGlobalSheet({ commit }) {
      commit('setGlobalSheet', false); 
    },
  },
  getters: {
    isProductsLoading(state) {
      return state.productsLoading; 
    },
    isFacetsLoading(state) {
      return state.facetsLoading;
    },
    isGlobalSheet(state) {
      return state.globalSheet;
    },
    SearchQuery(state) {
      return state.searchQuery;
    },
  },
});
