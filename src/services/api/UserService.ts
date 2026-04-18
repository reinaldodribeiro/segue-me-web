import api from "@/config/api";
import { AxiosResponse } from "axios";
import { UpdatePasswordPayload, User } from "@/interfaces/User";

class UserService {
  getProfile(): Promise<AxiosResponse<{ data: User }>> {
    return api.get<{ data: User }>("auth/me");
  }

  updateProfile(data: FormData): Promise<AxiosResponse<{ data: User }>> {
    return api.post<FormData, { data: User }>("me", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }

  updatePassword(data: UpdatePasswordPayload): Promise<AxiosResponse<void>> {
    return api.put<UpdatePasswordPayload, void>("me/password", data);
  }

  getTutorialSeen(): Promise<AxiosResponse<{ data: string[] }>> {
    return api.get<{ data: string[] }>("me/tutorial");
  }

  markTutorialSeen(route: string): Promise<AxiosResponse<{ data: string[] }>> {
    return api.post<{ route: string }, { data: string[] }>("me/tutorial", { route });
  }

  resetTutorial(): Promise<AxiosResponse<{ data: string[] }>> {
    return api.delete("me/tutorial") as unknown as Promise<AxiosResponse<{ data: string[] }>>;
  }
}

export default new UserService();
