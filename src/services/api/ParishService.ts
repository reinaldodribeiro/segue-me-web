import api from "@/config/api";
import { AxiosResponse } from "axios";
import { PaginatedResponse } from "@/interfaces/App";
import { Parish, ParishPayload } from "@/interfaces/Parish";
import { CrudService } from "./CrudService";

class ParishService extends CrudService<Parish, ParishPayload> {
  protected baseUrl(): string {
    return "parishes";
  }

  /** GET /sectors/{sector}/parishes */
  listBySector(
    sectorId: string,
    params?: Record<string, unknown>,
  ): Promise<AxiosResponse<PaginatedResponse<Parish>>> {
    return api.get(`sectors/${sectorId}/parishes`, { params });
  }

  /** POST /sectors/{sector}/parishes */
  createInSector(
    sectorId: string,
    data: ParishPayload,
  ): Promise<AxiosResponse<{ data: Parish }>> {
    return api.post(`sectors/${sectorId}/parishes`, data);
  }

  /** PUT /parishes/{parish} — backend expects PUT, not PATCH */
  put(
    id: string,
    data: Partial<ParishPayload & { active: boolean }>,
  ): Promise<AxiosResponse<{ data: Parish }>> {
    return api.put(`parishes/${id}`, data);
  }

  /** POST /parishes/{parish}/logo */
  uploadLogo(id: string, file: File): Promise<AxiosResponse<{ data: Parish }>> {
    const form = new FormData();
    form.append("logo", file);
    return api.post(`parishes/${id}/logo`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }

  /** GET /parishes/{parish}/skills */
  listSkills(id: string): Promise<AxiosResponse<{ data: string[] }>> {
    return api.get(`parishes/${id}/skills`);
  }

  /** POST /parishes/{parish}/skills */
  addSkill(
    id: string,
    skill: string,
  ): Promise<AxiosResponse<{ data: string[] }>> {
    return api.post(`parishes/${id}/skills`, { skill });
  }

  /** DELETE /parishes/{parish}/skills */
  removeSkill(
    id: string,
    skill: string,
  ): Promise<AxiosResponse<{ data: string[] }>> {
    return api.delete<{ data: string[] }>(`parishes/${id}/skills`, {
      data: { skill },
    });
  }
}

export default new ParishService();
