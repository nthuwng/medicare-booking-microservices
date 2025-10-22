import axios from "services/axios.customize";

export const loginAPI = (email: string, password: string) => {
  const urlBackend = "/api/auth/login";
  return axios.post<IBackendRes<ILogin>>(urlBackend, { email, password });
};

export const fetchAccountAPI = () => {
  const urlBackend = "/api/auth/account";
  return axios.get<IBackendRes<IFetchAccount>>(urlBackend);
};

export const registerAPI = (
  email: string,
  password: string,
  userType: string
) => {
  const urlBackend = "/api/auth/register";
  return axios.post<IBackendRes<IRegister>>(urlBackend, {
    email,
    password,
    userType,
  });
};

export const loginWithGoogleAPI = (credential: string) => {
  const urlBackend = "/api/auth/login-with-google";
  return axios.post<IBackendRes<ILogin>>(urlBackend, { credential });
};