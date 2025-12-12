import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("login", "routes/login.tsx"),
  route("register", "routes/register.tsx"),
  route("search", "routes/search.tsx"),
  route("my_space", "routes/patient/espace_perso/main_perso.tsx"),
//   route("patient/dashboard", "routes/patient/dashboard.tsx"),
  route("doctor/dashboard", "routes/doctor/dashboard.tsx"),
//   route("admin/dashboard", "routes/admin/dashboard.tsx"),
] satisfies RouteConfig;
