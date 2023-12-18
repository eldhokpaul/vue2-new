import type { RouteConfig } from 'vue-router'

import routes from './modules/routes'

const redirects = [{
  path: '/newPassword/:userId/:verificationToken',
  redirect: {
    name: 'authAddNewPassword'
  }
},
{
  path: '/invite/:userId/:accountId/:invitationAction',
  redirect: {
    name: 'authLogin'
  }
},
{
  path: '/login/invite/:userId/:accountId/:verificationToken/:invitationAction',
  redirect: {
    name: 'InviteNewUser'
  }
},
// {
//   path: '/register',
//   redirect: {
//     name: 'authRegister'
//   }
// },
{
  path: '/reset',
  redirect: {
    name: 'authReset'
  }
},
{
  path: '/invite/:userId/:accountId/:invitationAction',
  redirect: (to: any) => {
    return {
      name: 'authLogin',
      params: { ...to.params }
    }
  }
},
{
  path: '/new-password/:userId/:verificationToken',
  redirect: (to: any) => {
    return {
      name: 'authAddNewPassword',
      params: { ...to.params }
    }
  }
},
{
  path: '/verify/:userId/:verificationToken',
  redirect: (to: any) => {
    return {
      name: 'authVerification',
      params: { ...to.params }
    }
  }
}
]

export default [
  {
    path: '/login',
    component: () => import(/* webpackChunkName: "auth-views" */ './views/index.vue'),
    children: [
      ...routes
    ],
    meta: {
      fullScreen: true
    }
  },
  ...redirects
] as Array<RouteConfig>
