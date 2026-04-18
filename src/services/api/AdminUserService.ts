import api from "@/config/api";
import { AxiosResponse } from "axios";
import { User, UserPayload } from "@/interfaces/User";
import { CrudService } from "./CrudService";

class AdminUserService extends CrudService<User, UserPayload> {
  protected baseUrl(): string {
    return "users";
  }

  /** Alias for search() — backward compatibility */
  show(id: string): Promise<AxiosResponse<{ data: User }>> {
    return this.search(id);
  }

  /** POST /users — custom create (different return type from CrudService.save) */
  create(data: UserPayload): Promise<AxiosResponse<{ data: User }>> {
    return api.post("users", data);
  }

  /** PUT /users/{user} — backend expects PUT, not PATCH */
  update(
    id: string,
    data: Partial<UserPayload>,
  ): Promise<AxiosResponse<{ data: User }>> {
    return api.put(`users/${id}`, data);
  }

  /** PATCH /users/{user}/toggle-active */
  toggleActive(id: string): Promise<AxiosResponse<{ data: User }>> {
    return api.patch(`users/${id}/toggle-active`, {});
  }

  /** GET movements — list movements from the user's parish */
  listMovements(
    id: string,
  ): Promise<AxiosResponse<{ data: { id: string; name: string }[] }>> {
    return api.get(`movements`);
  }

  /** PUT /users/{user}/movements — sync movement access */
  syncMovements(
    id: string,
    movementIds: string[],
  ): Promise<AxiosResponse<{ data: User }>> {
    return api.put(`users/${id}/movements`, { movement_ids: movementIds });
  }
}

export default new AdminUserService();
