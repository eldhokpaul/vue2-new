import type { RouteConfig } from 'vue-router'

// import { ensureToken } from '@/router/guards/ensureToken'

export default [
  {
    path: ':userId?/:accountId?/:invitationAction?',
    name: 'authLogin',
    props: true,
    component: () => import(/* webpackChunkName: "auth-views" */ './views/AuthLogin.vue')
  },
  {
    path: 'verify/:userId/:verificationToken',
    name: 'authVerification',
    props: true,
    component: () => import(/* webpackChunkName: "auth-views" */ './views/AuthVerification.vue')
  },
  {
    path: 'verify/invite/:userId/:accountId/:verificationToken/:invitationAction',
    name: 'InviteNewUser',
    props: true,
    component: () => import(/* webpackChunkName: "auth-views" */ './views/InviteNewUser.vue')
  },
  {
    path: 'verify/invite/user/:userId/:accountId/:invitationAction',
    name: 'InviteUser',
    props: true,
    component: () => import(/* webpackChunkName: "auth-views" */ './views/InviteUser.vue')
  },
  {
    path: 'reset',
    name: 'authResetPassword',
    component: () => import(/* webpackChunkName: "auth-views" */ './views/AuthResetPassword.vue')
  },
  {
    path: 'new-password/:userId/:verificationToken',
    props: true,
    name: 'authAddNewPassword',
    component: () => import(/* webpackChunkName: "auth-views" */ './views/AuthNewPassword.vue')
  },
  {
    path: '/register',
    name: 'authRegister',
    component: () => import(/* webpackChunkName: "auth-views" */ './views/AuthRegister.vue')
  },
  {
    path: '/set-up-account',
    name: 'setUpAccount',
    component: () => import(/* webpackChunkName: "auth-views" */ './views/SetUpAccount.vue'),
    meta: {
      fullScreen: true
    }
  }
] as Array<RouteConfig>
