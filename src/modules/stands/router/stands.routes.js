const StandsList = () => import('@/modules/stands/presentation/stands-list.vue');
const StandForm  = () => import('@/modules/stands/presentation/stand-form.vue');

export default [
    { 
      path: '/org/stands',         
      name: 'org-stands-list', 
      component: StandsList 
    },

    { 
      path: '/org/stands/:eventId/new',     
      name: 'org-stand-new',   
      component: StandForm  
    },

    { 
      path: '/org/stands/:eventId/:id/edit',
      name: 'org-stand-edit',  
      component: StandForm  
    }
];



