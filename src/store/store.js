import { createStore } from 'vuex'


export const store = createStore({
    state: {
        products: [],  
    },
    getters : {
        getProducts : state => state.products,      
    },
    actions : {
     
    }, 
    mutations: {

    },
    
})



