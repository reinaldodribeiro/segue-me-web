import api from "@/config/api";
import { AxiosResponse } from "axios";
import { DefaultResponse } from "@/interfaces/App";
import {
  ForgotPasswordPayload,
  LoginPayload,
  LoginResponse,
  ResetPasswordPayload,
} from "@/interfaces/Auth";

class AuthService {
  login(data: LoginPayload): Promise<AxiosResponse<LoginResponse>> {
    return api.post<LoginPayload, LoginResponse>("auth/login", data);
  }

  logout(): Promise<AxiosResponse<void>> {
    return api.post<void, void>("auth/logout");
  }

  forgotPassword(
    data: ForgotPasswordPayload,
  ): Promise<AxiosResponse<DefaultResponse>> {
    return api.post<ForgotPasswordPayload, DefaultResponse>(
      "forgot-password",
      data,
    );
  }

  resetPassword(
    data: ResetPasswordPayload,
  ): Promise<AxiosResponse<DefaultResponse>> {
    return api.post<ResetPasswordPayload, DefaultResponse>(
      "reset-password",
      data,
    );
  }
}

export default new AuthService();
