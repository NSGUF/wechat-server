import * as controller from './controller/index'


/**
 * All application routes.
 */
export const AppRoutes = [
  {
    path: "/users",
    method: "get",
    action: controller.users.getUsers
  },
  {
    path: "/register",
    method: "post",
    action: controller.users.register
  },
  {
    path: "/user",
    method: "get",
    action: controller.users.getUser
  },
  {
    path: "/delete/:id",
    method: "post",
    action: controller.users.deleteUser
  },
  {
    path: "/search/friend",
    method: 'post',
    action: controller.users.searchUser
  },
  {
    path: "/login",
    method: 'post',
    action: controller.users.doLogin
  },
  {
    path: "/captcha",
    method: 'get',
    action: controller.tools.captcha
  },
  {
    path: "/get/messages",
    method: 'get',
    action: controller.messages.getMessagesByTwoId
  },
];


